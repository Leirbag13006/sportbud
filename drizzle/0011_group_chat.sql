CREATE TABLE `group_chat_reads` (
	`activity_id` text NOT NULL,
	`user_id` text NOT NULL,
	`read_at` integer NOT NULL,
	PRIMARY KEY(`activity_id`, `user_id`),
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`kind` text DEFAULT 'text' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "group_messages_content_length" CHECK(length(trim("group_messages"."content")) between 1 and 2000)
);
--> statement-breakpoint
CREATE INDEX `group_messages_activity_id_created_at_idx` ON `group_messages` (`activity_id`,`created_at`);