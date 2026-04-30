
package com.gyansetu.security;
import com.gyansetu.model.User; import com.gyansetu.repository.UserRepository; import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain; import jakarta.servlet.ServletException; import jakarta.servlet.http.*;
import org.springframework.http.HttpHeaders; import org.springframework.security.authentication.*; import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils; import org.springframework.web.filter.OncePerRequestFilter; import java.io.IOException; import java.util.*;
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil; private final UserRepository userRepository;
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository){ this.jwtUtil=jwtUtil; this.userRepository=userRepository; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.parse(token).getBody(); String username = claims.getSubject(); String role = claims.get("role", String.class);
                Optional<User> opt = userRepository.findByUsername(username);
                if (opt.isPresent()) {
                    List<GrantedAuthority> auths = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                    Authentication auth = new UsernamePasswordAuthenticationToken(username, null, auths);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignore) { }
        }
        chain.doFilter(request, response);
    }
}
