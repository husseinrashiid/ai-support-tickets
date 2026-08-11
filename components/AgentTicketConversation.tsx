"use client";

import { useRef } from "react";
import {
  MessageThread,
  type LeadingEntry,
  type MessageThreadHandle,
  type MessageWithAttachments,
} from "@/components/MessageThread";
import { SuggestedResponseEditor } from "@/components/SuggestedResponseEditor";

export function AgentTicketConversation({
  ticketId,
  status,
  viewerId,
  initialMessages,
  leadingEntries,
  aiInitialValue,
}: {
  ticketId: string;
  status: string;
  viewerId: string;
  initialMessages: MessageWithAttachments[];
  leadingEntries: LeadingEntry[];
  aiInitialValue: string;
}) {
  const threadRef = useRef<MessageThreadHandle>(null);

  return (
    <>
      <MessageThread
        ref={threadRef}
        ticketId={ticketId}
        status={status}
        viewerId={viewerId}
        initialMessages={initialMessages}
        leadingEntries={leadingEntries}
      />
      <SuggestedResponseEditor
        ticketId={ticketId}
        initialValue={aiInitialValue}
        onUseReply={(text) => threadRef.current?.useReply(text)}
      />
    </>
  );
}
