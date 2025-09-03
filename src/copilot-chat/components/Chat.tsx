import React, { useEffect, useState } from "react";
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
		updateConversation, // for updating conversation messages
	} = useCopilotStore();

	// Edit state
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editValue, setEditValue] = useState<string>("");

	// Get current conversation
	const conversation = activeConversationId
		? conversations.find((conv) => conv.id === activeConversationId)
		: undefined;

	useEffect(() => {
		if (plugin) {
			initConversationService(plugin);
		}
	}, [plugin, initConversationService]);


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

		// Handler: Save edited message and truncate history
			const handleSubmitEdit = async () => {
				if (editingIndex === null || !conversation || !plugin) return;
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
				setEditingIndex(null);
				setEditValue("");
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
