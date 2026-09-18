package com.studysync.studysyncbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // This is the endpoint clients will connect to for WebSocket handshake.
        // '/ws' is a common convention.
        // .withSockJS() provides fallback options for browsers that don't support
        // WebSocket.
        registry.addEndpoint("/ws")
                // Allow connections from any origin during development - ADJUST FOR PRODUCTION!
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // Configure the message broker.
        // Messages whose destination starts with "/app" should be routed to
        // @MessageMapping methods in controllers.
        registry.setApplicationDestinationPrefixes("/app");

        // Messages whose destination starts with "/topic" should be routed to the
        // message broker.
        // The broker broadcasts messages to all subscribed clients.
        // We use a simple in-memory broker here. For production, consider RabbitMQ or
        // others.
        registry.enableSimpleBroker("/topic");

        // Optionally, configure user destination prefix (for user-specific messages,
        // e.g., private chats)
        // registry.setUserDestinationPrefix("/user");
    }
}