package org.dev.powermarket.service.dto;


import jakarta.validation.constraints.*;
import org.dev.powermarket.domain.enums.Role;

public class RegisterRequest {
    @Email 
    @NotBlank(message = "Email обязателен для заполнения")
    private String email;

    @NotBlank(message = "Пароль обязателен для заполнения")
    @Size(min = 8, max = 100, message = "Пароль должен содержать от 8 до 100 символов")
    private String password;

    @NotNull(message = "Роль пользователя обязательна")
    private Role role;

    @NotBlank(message = "ФИО обязательно для заполнения")
    @Size(max = 200)
    private String fullName;

    @NotBlank(message = "Название компании обязательно для заполнения")
    @Size(max = 200)
    private String companyName;

    @NotBlank(message = "ИНН обязателен для заполнения")
    @Pattern(regexp = "\\d{10}|\\d{12}", message = "ИНН должен содержать 10 или 12 цифр")
    private String inn;

    @Pattern(regexp = "\\+?[0-9]{10,15}", message = "Некорректный формат номера телефона")
    private String phone;

    private String address;

    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getInn() { return inn; }
    public void setInn(String inn) { this.inn = inn; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }


    @Override
    public String toString() {
        return "RegisterRequest{" +
                "email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role=" + role +
                ", fullName='" + fullName + '\'' +
                ", companyName='" + companyName + '\'' +
                ", inn='" + inn + '\'' +
                ", phone='" + phone + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
