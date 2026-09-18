package com.studysync.studysyncbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.data.jpa.repository.config.EnableJpaAuditing
public class StudysyncBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudysyncBackendApplication.class, args);
	}

}
