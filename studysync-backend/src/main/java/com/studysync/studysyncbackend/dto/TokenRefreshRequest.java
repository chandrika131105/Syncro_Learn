package com.studysync.studysyncbackend.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
