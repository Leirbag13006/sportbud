CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`key_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_attempts_key_hash_created_at_idx` ON `login_attempts` (`key_hash`,`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`applicant_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "applications_status_check" CHECK("__new_applications"."status" in ('pending', 'accepted', 'rejected', 'withdrawn')),
	CONSTRAINT "applications_message_length" CHECK("__new_applications"."message" is null or length("__new_applications"."message") <= 300)
);
--> statement-breakpoint
INSERT INTO `__new_applications`("id", "activity_id", "applicant_id", "status", "message", "created_at", "updated_at") SELECT "id", "activity_id", "applicant_id", "status", "message", "created_at", "updated_at" FROM `applications`;--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
ALTER TABLE `__new_applications` RENAME TO `applications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `applications_activity_applicant_unique` ON `applications` (`activity_id`,`applicant_id`);--> statement-breakpoint
CREATE INDEX `applications_applicant_id_idx` ON `applications` (`applicant_id`);