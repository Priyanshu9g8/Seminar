
package com.gyansetu.dto;
import jakarta.validation.constraints.NotBlank;
public class AuthRequest {
    @NotBlank private String username; @NotBlank private String password;
    public String getUsername(){return username;} public void setUsername(String v){this.username=v;}
    public String getPassword(){return password;} public void setPassword(String v){this.password=v;}
}
