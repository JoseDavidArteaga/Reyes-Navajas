package co.edu.unicauca.autmicroservice.dto;

import java.util.List;

public class UserStatusResponse {
    private String userId;
    private String username;
    private boolean enabled;
    private List<String> roles;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
