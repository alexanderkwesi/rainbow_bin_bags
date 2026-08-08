# Rainbow Bags - Premium Bin Bags E-Commerce Shop

A self-contained, fully featured e-commerce website designed to sell bin bags of all sizes. The storefront is styled with a gorgeous, high-end white background with vibrant rainbow gradients, modern glassmorphic navbars, cart drawers, and micro-animations.

The project features a lightweight **PHP backend** running on **SQLite** to manage products, sales statistics, order processing, and support messages, with frontend **PayPal** payment checkouts.

---

## Features

1. **Vibrant & White Design**: Glassmorphism headers, gradient typography, hover effects, and custom responsive columns.
2. **Product Categories**: Dynamic client-side filtering for Small, Medium, Large, and Extra Large sizes.
3. **Interactive Cart**: Sidebar drawer that handles adding, updating quantities, deleting items, and calculating subtotals using local storage.
4. **PayPal Payments**: Fully integrated PayPal Smart Payment Buttons (in sandbox mode using test client ID `sb`).
5. **Contact System**: Message input fields that submit customer inquiries directly to the database via AJAX.
6. **Management Dashboard (The "Artifact")**: A complete admin control center located at `/admin.php` that manages:
   - **Sales Overview**: Total revenue count, total orders, average order values, and CSS-drawn size-breakdown charts.
   - **Products**: Complete CRUD management (add, edit, delete, modify price/stock/size).
   - **Orders**: Tracking details, customer delivery addresses, purchased items, and status indicators (Paid, Processing, Shipped, Cancelled).
   - **Messages**: View received customer queries, toggle status (Read/Unread), and delete support logs.

---

## Project Structure

```text
rainbow_bin_bags/
│
├── database.sqlite       # Auto-created SQLite file database
├── db.php                # Database helper (creates tables & seeds defaults)
├── index.php             # Core storefront catalog, cart, and contact UI
├── checkout.php          # Order checkout summary review & PayPal buttons
├── process_order.php     # Endpoint to record orders & decrement stocks
├── contact.php           # Endpoint to record customer contact queries
├── success.php           # Customer order landing page
├── admin.php             # Admin panel to manage sales, orders, products & messages
├── style.css             # Main styling stylesheet
├── app.js                # Core frontend cart logic & PayPal hooks
└── readme.md             # This instruction documentation
```

---

## Setup Instructions

### Prerequisites
- Make sure you have **PHP** (v7.4 or later) installed on your system.

### 1. Launch the Local Server
Open your terminal (PowerShell, Command Prompt, or Bash) in this project directory and execute the built-in PHP development server:

```bash
php -S localhost:8000
```

### 2. View the Storefront
Open your web browser and navigate to:
`http://localhost:8000`

The first time you load the page, SQLite will automatically create `database.sqlite` and seed it with 5 default bin bag sizes.

### 3. Open the Administration Panel
Navigate to:
`http://localhost:8000/admin.php`

**Login Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

---

## Testing PayPal Checkout
The PayPal Buttons are configured using the sandbox test client ID `sb` on the frontend. When checking out:
1. When you click the PayPal button, a login popup will appear.
2. You can use standard PayPal developer sandbox accounts to test payments, or simply view the interface loading.
3. Upon authorizing sandbox checkout, the checkout system redirects to `success.php`, updating product inventory stocks and recording sales details in the SQLite database automatically.
