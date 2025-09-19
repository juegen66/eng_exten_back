CREATE TABLE `email_verification_code` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`purpose` text DEFAULT 'register' NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_verification_code_email_purpose_idx` ON `email_verification_code` (`email`,`purpose`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`nickname` text,
	`user_type` integer DEFAULT 2 NOT NULL,
	`user_email` text,
	`user_status` integer DEFAULT 1 NOT NULL,
	`user_phone` text,
	`login_time` integer,
	`avatar` text,
	`sex` integer DEFAULT 0,
	`remarks` text,
	`client_host` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_user_email_unique` ON `user` (`user_email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_user_phone_unique` ON `user` (`user_phone`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `user_user_email_idx` ON `user` (`user_email`);--> statement-breakpoint
CREATE INDEX `user_user_phone_idx` ON `user` (`user_phone`);--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
DROP TABLE `users`;