CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`sport_type` text NOT NULL,
	`description` text,
	`location_name` text,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`starts_at` integer NOT NULL,
	`duration_minutes` integer DEFAULT 60 NOT NULL,
	`required_level` text,
	`spots_total` integer NOT NULL,
	`spots_available` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "activities_sport_type_check" CHECK("activities"."sport_type" in ('football', 'basketball', 'tennis', 'padel', 'badminton', 'volleyball', 'running', 'cycling', 'swimming', 'climbing', 'fitness', 'other')),
	CONSTRAINT "activities_required_level_check" CHECK("activities"."required_level" is null or "activities"."required_level" in ('beginner', 'intermediate', 'pro')),
	CONSTRAINT "activities_status_check" CHECK("activities"."status" in ('open', 'full', 'cancelled')),
	CONSTRAINT "activities_lat_range" CHECK("activities"."lat" between -90 and 90),
	CONSTRAINT "activities_lng_range" CHECK("activities"."lng" between -180 and 180),
	CONSTRAINT "activities_duration_range" CHECK("activities"."duration_minutes" between 15 and 720),
	CONSTRAINT "activities_spots_total_range" CHECK("activities"."spots_total" between 1 and 50),
	CONSTRAINT "activities_spots_available_range" CHECK("activities"."spots_available" between 0 and "activities"."spots_total"),
	CONSTRAINT "activities_status_matches_spots" CHECK("activities"."status" = 'cancelled' or ("activities"."status" = 'full') = ("activities"."spots_available" = 0)),
	CONSTRAINT "activities_description_length" CHECK("activities"."description" is null or length("activities"."description") <= 500)
);
--> statement-breakpoint
CREATE INDEX `activities_status_starts_at_idx` ON `activities` (`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `activities_creator_id_idx` ON `activities` (`creator_id`);--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`applicant_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "applications_status_check" CHECK("applications"."status" in ('pending', 'accepted', 'rejected')),
	CONSTRAINT "applications_message_length" CHECK("applications"."message" is null or length("applications"."message") <= 300)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_activity_applicant_unique` ON `applications` (`activity_id`,`applicant_id`);--> statement-breakpoint
CREATE INDEX `applications_applicant_id_idx` ON `applications` (`applicant_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`read_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "messages_content_length" CHECK(length(trim("messages"."content")) between 1 and 2000)
);
--> statement-breakpoint
CREATE INDEX `messages_application_id_created_at_idx` ON `messages` (`application_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`bio` text,
	`sport_level` text DEFAULT 'beginner' NOT NULL,
	`avatar_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "users_sport_level_check" CHECK("users"."sport_level" in ('beginner', 'intermediate', 'pro')),
	CONSTRAINT "users_full_name_length" CHECK(length(trim("users"."full_name")) between 2 and 80),
	CONSTRAINT "users_bio_length" CHECK("users"."bio" is null or length("users"."bio") <= 500)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);