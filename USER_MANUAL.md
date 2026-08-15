# 📖 InvenTrack — Official User Manual & Operations Guide

Welcome to the **InvenTrack User Manual**. This document provides step-by-step instructions for operating every feature of the InvenTrack ERP & Inventory Management System.

---

## 📋 Table of Contents
- [1. System Overview & Access Roles](#system-overview--access-roles)
- [2. Getting Started & System Access](#getting-started--system-access)
- [3. Module 1: Dashboard & System Health](#module-1-dashboard--system-health)
- [4. Module 2: Point of Sale (POS) & Counter Sales](#module-2-point-of-sale-pos--counter-sales)
- [5. Module 3: Product Catalog & Category Management](#module-3-product-catalog--category-management)
- [6. Module 4: Stock Movements & Audit Trail](#module-4-stock-movements--audit-trail)
- [7. Module 5: Supplier Directory Management](#module-5-supplier-directory-management)
- [8. Module 6: Reports & Analytics Export Center](#module-6-reports--analytics-export-center)
- [9. Module 7: User Management & Security Controls](#module-7-user-management--security-controls)
- [10. Troubleshooting & Frequently Asked Questions](#troubleshooting--frequently-asked-questions)

---

<a id="system-overview--access-roles"></a>
## 1. System Overview & Access Roles

InvenTrack is a web-based retail Point-of-Sale (POS) and Enterprise Resource Planning (ERP) application designed for fast, accurate retail operations.

### User Roles & Permissions Matrix

| Feature / Action | Admin (`ADMIN`) | Staff (`STAFF`) |
|---|:---:|:---:|
| Counter Sales & POS Checkout | ✅ | ✅ |
| Print Thermal Receipts | ✅ | ✅ |
| View Product Catalog & Stock Levels | ✅ | ✅ |
| Record Stock Movements (`In/Out/Adjustment`) | ✅ | ✅ |
| Add / Edit Products | ✅ | ❌ |
| Create & Delete Categories | ✅ | ❌ |
| Add & Delete Suppliers | ✅ | ❌ |
| View Financial Analytics & Profit Reports | ✅ | ❌ |
| Export Audit Reports to CSV | ✅ | ❌ |
| Manage User Accounts & Deactivate Users | ✅ | ❌ |

---

<a id="getting-started--system-access"></a>
## 2. Getting Started & System Access

### Logging In
1. Open your web browser and navigate to the application URL (e.g., `http://localhost:3000` or `https://inventrack-5vjf.onrender.com`).
2. Enter your registered **Email Address** and **Password**.
3. Click **Sign In**.

> **Default Seed Credentials:**
> - **Administrator**: `admin@inventrack.com` | Password: `Admin@123`
> - **Sales Staff**: `staff@inventrack.com` | Password: `Staff@123`

### Security Notification (Deactivated Accounts)
If an Administrator deactivates a user account, the user will be automatically logged out on their next action or page refresh, and redirected to the login screen with a warning notice:  
*`"Your user account was deactivated by an administrator and you have been signed out."`*

---

<a id="module-1-dashboard--system-health"></a>
## 3. Module 1: Dashboard & System Health

The **Dashboard** serves as the primary command center for business managers.

### Key Metrics Displayed:
- **Total Revenue (GHS)**: Sum of all completed sales.
- **Total Products**: Count of active items in the product catalog.
- **Low Stock Alerts**: Number of items whose current stock level is equal to or below their configured reorder threshold.
- **Stock Movement Log**: Live feed of recent inventory additions and deductions.

---

<a id="module-2-point-of-sale-pos--counter-sales"></a>
## 4. Module 2: Point of Sale (POS) & Counter Sales

The **Sales** page provides a high-speed cashier checkout interface.

### Step-by-Step Sale Process:
1. **Selecting Products**:
   - **Quick Products Grid**: Click on any of the top 9 most active items displayed on the quick grid to add it directly to the bill cart.
   - **Catalog Search**: Use the top search bar to find any product in the entire catalog by SKU or product name.
2. **Adjusting Quantities**:
   - Use the **`+`** and **`-`** buttons in the billing cart to increase or decrease quantities.
   - Click the red trash icon to remove an item from the cart.
3. **Processing Payment & Completing Sale**:
   - Review the **Total Amount (GHS)** displayed at the bottom of the bill panel.
   - Click **Complete Sale**.
   - The system automatically records the sale, updates financial metrics, and deducts item quantities from inventory atomically.
4. **Printing Thermal Receipts**:
   - After completing a sale, click **Print Thermal Receipt**.
   - A dedicated thermal receipt popup window will launch, ready for 80mm thermal receipt printers.

---

<a id="module-3-product-catalog--category-management"></a>
## 5. Module 3: Product Catalog & Category Management

The **Products** page allows Administrators to manage all retail items.

### Adding a New Product:
1. Click **+ Add Product** at the top right of the Products page.
2. Fill in the product details:
   - **SKU Code**: Unique stock keeping unit (e.g. `BEV-003`).
   - **Product Name**: Full description of the item.
   - **Category**: Select an existing category.
   - **Cost Price (GHS)**: Wholesale purchase cost.
   - **Selling Price (GHS)**: Retail customer price.
   - **Reorder Level**: Minimum stock threshold before low stock warnings trigger.
   - **Initial Stock**: Starting quantity on hand.
3. Click **Save Product**.

### Category Management:
1. Click **Manage Categories**.
2. To create a category, type the category name and click **Add Category**.
3. To delete an unused category, click the red trash icon next to the category name.

---

<a id="module-4-stock-movements--audit-trail"></a>
## 6. Module 4: Stock Movements & Audit Trail

The **Stock Movements** page tracks all inventory movement into and out of the warehouse.

### Recording a Stock Movement:
1. Click **+ Record**.
2. Complete the stock form:
   - **Select Product**: Pick the product being updated.
   - **Movement Type**: Select `STOCK_IN` (receiving new stock), `STOCK_OUT` (spoilage/transfer), or `ADJUSTMENT` (stocktake reconciliation).
   - **Quantity**: Enter the numeric quantity.
   - **Supplier**: (Optional) Select the supplier for `STOCK_IN` orders.
   - **Reason**: Enter an audit explanation (e.g., *"Weekly stock replenishment"*).
3. Click **Save Movement**. The system instantly updates product quantities on hand and logs the audit entry.

---

<a id="module-5-supplier-directory-management"></a>
## 7. Module 5: Supplier Directory Management

The **Suppliers** page provides a directory of all wholesale vendors.

### Adding a Supplier:
1. Click **+ Add Supplier**.
2. Enter the Supplier Name, Contact Person, Phone Number, and Email.
3. Click **Save Supplier**.

### Deleting a Supplier:
1. Locate the supplier card in the directory.
2. Click the red trash icon on the supplier card.
3. Confirm deletion in the popup dialog.

---

<a id="module-6-reports--analytics-export-center"></a>
## 8. Module 6: Reports & Analytics Export Center

The **Reports** page gives Administrators full visibility into store performance.

### Available Reports & Exports:
- **Stock Level Report**: Current stock quantities, valuation, and reorder status.
- **Stock Movement Audit Log**: Complete historical record of all inventory changes.
- **Sales Performance Report**: Total sales revenue broken down by date and staff member.

### Exporting to CSV:
1. Navigate to the desired report tab on the Reports page.
2. Click **Export CSV**.
3. A spreadsheet file (`.csv`) will automatically download to your computer.

---

<a id="module-7-user-management--security-controls"></a>
## 9. Module 7: User Management & Security Controls

The **Users** page allows Administrators to manage staff accounts and access permissions.

### Creating a Staff Account:
1. Click **+ Add User**.
2. Enter Full Name, Email Address, Password, and Role (`ADMIN` or `STAFF`).
3. Click **Create User**.

### Deactivating / Reactivating User Accounts:
1. Locate the user in the User Accounts table.
2. Toggle the **Active / Inactive** switch.
3. If set to **Inactive**, the user's session is immediately revoked, preventing unauthorized system access.

---

<a id="troubleshooting--frequently-asked-questions"></a>
## 10. Troubleshooting & Frequently Asked Questions

### Q1: Why is my thermal receipt printing cut off on the right?
> **Solution**: Ensure your browser print dialog printer page margins are set to `None` or `Minimum` and paper size is set to `80mm` or `Roll Paper`.

### Q2: What happens if a sales staff member tries to sell more stock than is on hand?
> **Solution**: The POS system validates available stock before checkout. If an item is out of stock, an error banner notifies the cashier to record a `STOCK_IN` movement first.

### Q3: How do I change my login password?
> **Solution**: Ask an Administrator to update your account password on the User Accounts page.

---
*InvenTrack ERP System User Manual — Version 1.0 (2026)*
