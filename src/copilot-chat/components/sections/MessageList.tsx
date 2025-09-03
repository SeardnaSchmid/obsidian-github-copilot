import React, { useEffect, useRef } from "react";
import ChatMessage, { MessageProps } from "../atoms/Message";
import { concat, cx } from "../../../utils/style";

const BASE_CLASSNAME = "copilot-chat-message-list";

import EditIcon from "../atoms/EditIcon";

interface MessageListProps {
	messages: MessageProps[];
	onEditMessage?: (index: number) => void;
	editingIndex?: number | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onEditMessage, editingIndex }) => {
	const endOfMessagesRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (endOfMessagesRef.current) {
			endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

		return (
			<div className={concat(BASE_CLASSNAME, "container")}>
				{messages.map((message, index) => (
					<ChatMessage
						key={index}
						className={cx(
							concat(BASE_CLASSNAME, "item"),
							message.name === "GitHub Copilot"
								? concat(BASE_CLASSNAME, "assistant")
								: concat(BASE_CLASSNAME, "user"),
						)}
						icon={message.icon}
						name={message.name}
						message={message.message}
						isEditing={editingIndex === index}
						onEditMessage={message.name !== "GitHub Copilot" && onEditMessage ? () => onEditMessage(index) : undefined}
					/>
				))}
				<div ref={endOfMessagesRef} />
			</div>
		);
};

export default MessageList;
