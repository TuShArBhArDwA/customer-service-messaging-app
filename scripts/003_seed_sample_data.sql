-- Insert sample customers
INSERT INTO customers (email, name, phone) VALUES
  ('john.doe@example.com', 'John Doe', '+1234567890'),
  ('jane.smith@example.com', 'Jane Smith', '+0987654321'),
  ('bob.wilson@example.com', 'Bob Wilson', '+1122334455')
ON CONFLICT DO NOTHING;

-- Insert sample customer profiles
INSERT INTO customer_profiles (customer_id, account_status, account_age_days, loan_status, loan_amount)
SELECT id, 'active', 45, 'pending_approval', 50000 FROM customers WHERE email = 'john.doe@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO customer_profiles (customer_id, account_status, account_age_days, loan_status, loan_amount)
SELECT id, 'active', 30, 'approved', 75000 FROM customers WHERE email = 'jane.smith@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO customer_profiles (customer_id, account_status, account_age_days, loan_status, loan_amount)
SELECT id, 'active', 60, 'disbursed', 100000 FROM customers WHERE email = 'bob.wilson@example.com'
ON CONFLICT DO NOTHING;

-- Insert sample canned messages
INSERT INTO canned_messages (title, content, category) VALUES
  ('Loan Status Update', 'Your loan is currently under review. We will notify you once a decision is made.', 'loan_status'),
  ('Account Information Update', 'To update your account information, please log in and visit your profile settings.', 'account_info'),
  ('Payment Instructions', 'You can make payments through our app or website. Please ensure to pay by the due date.', 'payments'),
  ('Approval Timeline', 'Loan approvals typically take 3-5 business days. Thank you for your patience!', 'approval'),
  ('Disbursement Status', 'Your loan has been approved and will be disbursed within 1-2 business days.', 'disbursement')
ON CONFLICT DO NOTHING;
