package com.finance.tracker.dto;

public record AuthResponse(String token, String userId, String name, String email) {}
