-- CreateTable
CREATE TABLE `Job` (
    `id` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `jobType` ENUM('FULL_TIME', 'FREELANCE', 'PROJECT_BASED', 'INTERNSHIP', 'BOOTCAMP', 'CONTRACT', 'PART_TIME') NOT NULL DEFAULT 'FULL_TIME',
    `company` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `sourceLink` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `duration` VARCHAR(191) NULL,
    `deadline` DATETIME(3) NOT NULL,
    `openingDate` DATETIME(3) NULL,
    `priority` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('TO_BE_APPLY', 'ON_PROGRESS', 'APPLIED', 'CLOSED') NOT NULL DEFAULT 'TO_BE_APPLY',
    `plannedApplyDate` DATETIME(3) NULL,
    `plannedApplyTime` VARCHAR(191) NULL,
    `applyNotes` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
