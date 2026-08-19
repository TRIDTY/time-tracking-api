package com.timetracking.api.auth;

import com.timetracking.api.auth.AuthDtos.LoginRequest;
import com.timetracking.api.auth.AuthDtos.LoginResponse;
import com.timetracking.api.auth.AuthDtos.RegisterRequest;
import com.timetracking.api.auth.AuthDtos.UserResponse;
import com.timetracking.api.common.EmailAlreadyUsedException;
import com.timetracking.api.security.JwtService;
import com.timetracking.api.security.UserPrincipal;
import com.timetracking.api.user.User;
import com.timetracking.api.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = ((UserPrincipal) authentication.getPrincipal()).getUser();
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Bearer", jwtService.getExpirationMs());
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException(request.email());
        }
        User user = new User(request.name(), request.email(),
                passwordEncoder.encode(request.password()), request.role());
        user = userRepository.save(user);
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}
