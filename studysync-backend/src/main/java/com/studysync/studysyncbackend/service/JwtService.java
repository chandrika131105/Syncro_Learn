package com.studysync.studysyncbackend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; // Import Value annotation
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // It's highly recommended to externalize this secret key in application.properties
    // And make it much longer and more complex in a real application!
    @Value("${application.security.jwt.secret-key}") // Read secret key from properties
    private String SECRET_KEY;

    @Value("${application.security.jwt.expiration}") // Read expiration time from properties
    private long jwtExpiration;


    // Extracts the username (email in our case) from the token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Generic method to extract any claim from the token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Generates a JWT token for a user without extra claims
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    // Generates a JWT token for a user with extra claims
    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    // Builds the JWT token with specified claims, user details, and expiration
    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) // Subject is the username (email)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Token issue time
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Token expiration time
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Sign with HS256 algorithm and secret key
                .compact(); // Build the token string
    }


    // Validates if the token belongs to the user and is not expired
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // Checks if the token has expired
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Extracts the expiration date from the token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extracts all claims from the token payload
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Gets the signing key used for verifying the token's signature
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}