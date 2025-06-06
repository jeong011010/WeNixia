package com.cloud.phoenixia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleRequestDTO {
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "날짜 형식은 yyyy-MM-dd 이어야 합니다.")
    private String date;

    @NotBlank(message = "시간은 비어 있을 수 없습니다.")
    private String time;

    @NotBlank(message = "제목은 비어 있을 수 없습니다.")
    private String title;
}