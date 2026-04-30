
package com.gyansetu.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
import java.security.Key; import java.util.Date; import java.util.Map;
@Component
public class JwtUtil {
    private final Key key; private final long expirationMillis;
    public JwtUtil(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-millis}") long expirationMillis){
        this.key = Keys.hmacShaKeyFor(secret.getBytes()); this.expirationMillis = expirationMillis; }
    public String generateToken(String username, String role, Long userId){ long now=System.currentTimeMillis();
        return Jwts.builder().setSubject(username).addClaims(Map.of("role", role, "uid", userId))
            .setIssuedAt(new Date(now)).setExpiration(new Date(now+expirationMillis))
            .signWith(key, SignatureAlgorithm.HS256).compact(); }
    public Jws<Claims> parse(String token){ return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); }
}
