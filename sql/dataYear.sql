ALTER TABLE `financials`
ADD COLUMN `dataYear` INT AFTER `reportDate`;

UPDATE `financials`
SET `dataYear` = CASE
    WHEN MONTH(`reportDate`) <= 7 THEN YEAR(`reportDate`) - 1
    WHEN MONTH(`reportDate`) >= 8 THEN YEAR(`reportDate`)
    END;