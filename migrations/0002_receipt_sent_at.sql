-- One receipt per Mollie payment. Do not apply this to production until the receipt code is deployed.
ALTER TABLE signups ADD COLUMN receipt_sent_at TEXT;
