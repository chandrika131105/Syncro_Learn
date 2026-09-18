package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto {
    private String content;
    private String sender; // Could be username, user ID, etc.
    // You might add message type (CHAT, JOIN, LEAVE), timestamp, etc. later
}