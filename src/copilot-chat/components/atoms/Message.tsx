import React, { useMemo } from "react";
import { concat, cx } from "../../../utils/style";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { usePlugin } from "../../hooks/usePlugin";

const BASE_CLASSNAME = "copilot-chat-message";

export interface MessageProps {
	className?: string;
	icon: string;
	name: string;
	message: string;
	linkedNotes?: {
		path: string;
		filename: string;
		content: string;
	}[];
	isEditing?: boolean;
}

interface CodeProps {
	node?: unknown;
	className?: string;
	inline?: boolean;
	children?: React.ReactNode;
}

const ChatMessage: React.FC<MessageProps & { onEditMessage?: () => void }> = (props) => {
	const { className, icon, name, message, linkedNotes, isEditing, onEditMessage } = props;
	const plugin = usePlugin();
	const [isCopied, setIsCopied] = React.useState(false);

	const isDarkTheme = useMemo(() => {
		return document.body.classList.contains("theme-dark");
	}, [plugin?.app]);

	const handleCopyMessage = () => {
		navigator.clipboard
			.writeText(message)
			.then(() => {
				setIsCopied(true);
				setTimeout(() => {
					setIsCopied(false);
				}, 2000);
			})
			.catch((err) => {
				console.error("Failed to copy message: ", err);
			});
	};

	return (
		<div className={cx(concat(BASE_CLASSNAME, "container"), className || "")} style={{ width: "100%" }}>
			<div className={concat(BASE_CLASSNAME, "info")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div style={{ display: "flex", alignItems: "center" }}>
					<div className={concat(BASE_CLASSNAME, "icon")} dangerouslySetInnerHTML={{ __html: icon }} />
					<div className={concat(BASE_CLASSNAME, "name")}>{name}</div>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
					<button
						className={concat(BASE_CLASSNAME, "copy-button")}
						onClick={handleCopyMessage}
						title={isCopied ? "Copied!" : "Copy message"}
						aria-label={isCopied ? "Copied!" : "Copy message"}
					>
						{isCopied ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
							</svg>
						)}
					</button>
					{name !== "GitHub Copilot" && onEditMessage && (
						<button
							type="button"
							title="Edit message"
							aria-label="Edit message"
							className={concat(BASE_CLASSNAME, "list-edit-icon")}
							style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
							onClick={onEditMessage}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M12 20h9" />
								<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
							</svg>
						</button>
					)}
				</div>
			</div>
						<div className={concat(BASE_CLASSNAME, "message")}>
						{isEditing ? (
							<span style={{ fontStyle: "italic", color: "#888" }}>[Editing...]</span>
						) : (
							<ReactMarkdown
								components={{
									p({ children }) {
										return <p style={{ whiteSpace: "pre-wrap" }}>{children}</p>;
									},
									code({ className, inline, children, ...props }: CodeProps) {
										const match = /language-(\w+)/.exec(className || "");
										return !inline && match ? (
											<SyntaxHighlighter
												language={match[1]}
												style={isDarkTheme ? vscDarkPlus : (oneLight as Record<string, React.CSSProperties>)}
												PreTag="div"
												className={`theme-${isDarkTheme ? "dark" : "light"}`}
												customStyle={{ background: "var(--code-background)", borderRadius: "4px" }}
												{...props}
											>
												{String(children || "").replace(/\n$/, "")}
											</SyntaxHighlighter>
										) : (
											<code className={className} {...props}>{children}</code>
										);
									},
								}}
							>
								{message}
							</ReactMarkdown>
						)}

				{linkedNotes && linkedNotes.length > 0 && (
					<div className={concat(BASE_CLASSNAME, "linked-notes")}>
						<div
							className={concat(
								BASE_CLASSNAME,
								"linked-notes-title",
							)}
						>
							Linked Notes:
						</div>
						<div
							className={concat(
								BASE_CLASSNAME,
								"linked-notes-list",
							)}
						>
							{linkedNotes.map((note, index) => (
								<div
									key={index}
									className={concat(
										BASE_CLASSNAME,
										"linked-note",
									)}
								>
									<span
										className={concat(
											BASE_CLASSNAME,
											"linked-note-filename",
										)}
									>
										[[{note.filename}]]
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatMessage;
