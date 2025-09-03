
import React, { useEffect, useState } from "react";
import { sendMessage as sendMessageApi } from "../api/sendMessage";
import MainLayout from "../layouts/MainLayout";
import NoHistory from "./sections/NoHistory";
import Header from "./sections/Header";
import Input from "./sections/Input";
import MessageList from "./sections/MessageList";
import { MessageProps } from "./atoms/Message";
import { copilotIcon } from "../../assets/copilot";
import { userIcon } from "../../assets/user";
import { useCopilotStore } from "../store/store";
import { usePlugin } from "../hooks/usePlugin";

const Chat: React.FC = () => {
	const plugin = usePlugin();
	const {
		messages,
		isLoading,
		conversations,
		activeConversationId,
		initConversationService,
		updateConversation,
		sendMessage,
	} = useCopilotStore();

	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editValue, setEditValue] = useState<string>("");

	useEffect(() => {
		if (plugin) {
			initConversationService(plugin);
		}
	}, [plugin, initConversationService]);

	const conversation = activeConversationId
		? conversations.find((conv) => conv.id === activeConversationId)
		: undefined;

	const displayMessages = conversation ? conversation.messages : messages;
	const formattedMessages: MessageProps[] = displayMessages.map((message, idx) => ({
		icon: message.role === "assistant" ? copilotIcon : userIcon,
		name: message.role === "assistant" ? "GitHub Copilot" : "User",
		message: message.content,
		linkedNotes: message.linkedNotes,
		isEditing: editingIndex === idx,
	}));

	// Handler: Start editing a user message
	const handleEditMessage = (index: number) => {
		if (displayMessages[index]?.role !== "user") return;
		setEditingIndex(index);
		setEditValue(displayMessages[index].content);
	};

	// Handler: Cancel editing
	const handleCancelEdit = () => {
		setEditingIndex(null);
		setEditValue("");
	};

	// Handler: Save edited message and truncate history, then send to LLM (no duplicate user entry)
	const handleSubmitEdit = async () => {
		if (editingIndex === null || !conversation || !plugin) return;
		// Immediately exit edit mode so UI switches to 'Thinking...'
		setEditingIndex(null);
		setEditValue("");

		// Truncate messages up to and including the edited one
		const truncated = [
			...conversation.messages.slice(0, editingIndex),
			{ ...conversation.messages[editingIndex], content: editValue },
		];
		// Update conversation
		updateConversation(plugin, {
			...conversation,
			messages: truncated,
		});

		// Set isLoading to true in the store
		useCopilotStore.setState({ isLoading: true });

		// Build prompt from truncated messages
		const promptMessages = truncated.map(
			(msg): { content: string; role: "user" | "assistant" | "system" } => ({
				content: msg.content,
				role:
					msg.role === "user" ||
					msg.role === "assistant" ||
					msg.role === "system"
						? msg.role
						: "user",
			})
		);
		// Optionally add system prompt
		const systemPrompt = plugin?.settings.systemPrompt;
		const messagesToSend: { content: string; role: "user" | "assistant" | "system" }[] = systemPrompt
			? [
				{ content: systemPrompt, role: "system" as "system" },
				...promptMessages
			]
			: promptMessages;
		// Get model
		const model = conversation.model.value;
		// Prepare request
		const requestData = {
			intent: false,
			model,
			temperature: 0,
			top_p: 1,
			n: 1,
			stream: false,
			messages: messagesToSend,
		};
		// Get token and send
		try {
			const validToken = await useCopilotStore.getState().checkAndRefreshToken(plugin);
			if (!validToken) throw new Error("Failed to get a valid access token");
			const response = await sendMessageApi(requestData, validToken);
			if (response && response.choices && response.choices.length > 0) {
				const assistantMessage = {
					id: response.id || Date.now().toString() + "-assistant",
					content: response.choices[0].message.content,
					role: "assistant" as "assistant",
					timestamp: Date.now(),
				};
				updateConversation(plugin, {
					...conversation,
					messages: [...truncated, assistantMessage],
				});
			}
		} catch (error) {
			console.error("Error sending edited message:", error);
		} finally {
			useCopilotStore.setState({ isLoading: false });
		}
	};

	return (
		<MainLayout>
			<Header />
			{formattedMessages.length === 0 ? (
				<NoHistory />
			) : (
				<MessageList
					messages={formattedMessages}
					onEditMessage={handleEditMessage}
					editingIndex={editingIndex}
				/>
			)}
			<Input
				isLoading={isLoading}
				editValue={editValue}
				setEditValue={setEditValue}
				isEditing={editingIndex !== null}
				onSubmitEdit={handleSubmitEdit}
				onCancelEdit={handleCancelEdit}
			/>
		</MainLayout>
	);
};

export default Chat;
