// i18n.ts
import i18n, { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ملفات الترجمة
// i18n.ts (القسم المحدّث فقط)
const resources = {
  en: {
    translation: {
      "Header": {
        "home": "Home",
        "categories": "Categories",
        "trends": "Trends",
        "cart": "Cart",
        "profile": "Me",
        "dashboard": "Dashboard",
        "logout": "Logout",
        "login": "Login",
        "register": "Register Account",
        "search": "Search",
        "searchPlaceholder": "Search for products...",
        "noSearchResults": "No search results",
        "notifications": "Notifications",
        "noNewNotifications": "No new notifications",
        "markAllAsRead": "Mark all as read",
        "newNotifications": "{{count}} new",
        "myOrders": "My Orders",
        "wishlist": "Wishlist",
        "luxuryMarketplace": "Luxury Marketplace"
      },
      "Sidebar": {
        "storeName": "My Store",
        "nav": {
          "overview": "Overview",
          "products": "Products",
          "orders": "Orders",
          "shipping":"Shipping",
          "agreements":"Agreements",
          "mySubscription":"my Subscription",
          "subscribe":"Subscribe",
          "wallet":"Wallet",
          "verification":"Verification",
          "models": "Models & Influencers",
          "influencers": "Influencers",
          "dropshipping": "DropShipping",
          "messages": "Messages",
          "analytics": "Analytics",
          "settings": "Store Settings"
        },
        "logout": "Logout"
      },
      "HomePage": {
        "title": "Discover Our Products",
        "loading": "Loading products...",
        "noProducts": "No products available at the moment."
      },
      "Login": {
        "title": "Login",
        "subtitle": "Welcome back to luxury",
        "emailLabel": "Email",
        "emailPlaceholder": "example@email.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Enter your password",
        "forgotPassword": "Forgot password?",
        "loginButton": "Login",
        "noAccount": "Don't have an account?",
        "createAccount": "Create new account",
        "or": "or",
        "google": "Google",
        "facebook": "Facebook",
        "loading": "Logging in...",
        "error": "Login failed. Please try again."
      },
      "joinUs":{
        "title": "Join Us as a Partner",
        "subtitle": "Create your professional account and grow your business with us.",
        "areYouACustomer": "Are you a customer?",
        "registerHere": "Register here"
      },
      "register": {
        "customerTitle": "Create Your Account",
        "customerSubtitle": "Join as a customer and start shopping with us today!",
        "fullNamePlaceholder": "Full Name",
        "emailPlaceholder": "Email Address",
        "accountTypeLabel": "Account Type",
        "accountTypePlaceholder": "Select your role",
        "merchant": "Merchant / Store Owner",
        "model": "Model",
        "areYouACustomer":"Are You A Customer?",
        "registerHere":"Register Here",
        "influencer": "Influencer / Content Creator",
        "dropshipper": "Dropshipper / Supplier",
        "errorNoRole": "Please select an account type.",
        "phonePlaceholder": "Phone Number (Optional)",
        "passwordPlaceholder": "Password",
        "loading": "Creating Account...",
        "registerButton": "Register",
        "errorDefault": "An error occurred. Please try again.",
        "alreadyHaveAccount": "Already have an account?",
        "login": "Log in",
        "areYouAPartner": "Are you a business or supplier?",
        "joinHere": "Join us here"
      },
      "AdminDashboard": {
        "header": {
          "title": "Admin Dashboard",
          "subtitle": "Comprehensive overview of platform performance and user statistics"
        },
        "actions": {
          "liveView": "Live Platform View",
          "lastUpdate": "Last updated: Now",
          "exportReport": "Export Report",
          "refreshData": "Refresh Data",
          "viewDetails": "View Details"
        },
        "stats": {
          "platformRevenue": "Platform Revenue",
          "totalRevenue": "Total revenue",
          "platformEarnings": "Platform Earnings",
          "netProfit": "Net profit",
          "totalUsers": "Total Users",
          "activeUsers": "{{count}} active users",
          "products": "Products",
          "activeProducts": "Active products",
          "orders": "Orders",
          "pendingOrders": "{{count}} pending orders",
          "agreements": "Agreements",
          "successfulCollabs": "Successful collaborations",
          "merchants": "Merchants",
          "registeredMerchants": "Registered merchants",
          "customers": "Customers",
          "activeCustomers": "Active customers"
        },
        "charts": {
          "sales": "Sales",
          "users": "Users",
          "salesTitle": "Sales Analysis",
          "salesSubtitle": "Sales performance over the selected period",
          "userDistribution": "User Distribution",
          "userDistributionSubtitle": "User distribution by role on the platform",
          "bar": "Bar",
          "area": "Area",
          "last7Days": "7 Days",
          "last30Days": "30 Days"
        },
        "activity": {
          "title": "Recent Activity",
          "subtitle": "Latest events and activities on the platform"
        },
        "goals": {
          "title": "Platform Goals",
          "subtitle": "Key performance indicators and progress",
          "userGrowth": "User Growth Rate",
          "orderCompletion": "Order Completion Rate",
          "merchantSatisfaction": "Merchant Satisfaction",
          "revenueGrowth": "Revenue Growth",
          "progress": "Progress"
        },
        "roles": {
          "merchants": "Merchants",
          "models": "Models",
          "influencers": "Influencers",
          "customers": "Customers"
        },
        "toast": {
          "refreshSuccess": "✨ Data refreshed successfully",
          "refreshError": "❌ Failed to load data",
          "preparingReport": "📊 Preparing report..."
        },
        "error": {
          "title": "Failed to load data",
          "message": "An error occurred while fetching dashboard analytics",
          "retry": "Retry"
        }
      },
      
      "roles": {
        "merchants": "Merchants",
        "models": "Models",
        "influencers": "Influencers",
        "customers": "Customers"
      },
      "AdminUsers": {
        "title": "Manage Users",
        "subtitle": "View and manage all users on the platform.",
        "userList": "User List",
        "totalUsers": "Total Users: {{count}}",
        "name": "Name",
        "email": "Email",
        "role": "Role",
        "statuss": "Status",
        "actionss": "Actions",
        "registrationDate": "Registration Date",
        "lastLogin": "Last Login",
        "neverLoggedIn":"Never Logged In",
        "loading": "Loading users...",
        "noUsers": "No users found.",
        "searchPlaceholder": "Search by name, email, or phone...",
        "allRoles": "All Roles",
        "allStatuses": "All Statuses",
        "activeOnly": "Active Only",
        "bannedOnly": "Banned Only",
        "exportData": "Export Data",
        "refresh": "Refresh",
        "stats": {
          "total": "Total Users",
          "active": "Active",
          "banned": "Banned",
          "models": "Models",
          "merchants": "Merchants",
          "admins": "Admins"
        },
        "status": {
          "active": "Active",
          "banned": "Banned",
          "verified": "Verified"
        },
        "roles": {
          "Admin": "Admin",
          "Merchant": "Merchant",
          "Model": "Model"
        },
        "actions": {
          "editRole": "Edit Role",
          "banUser": "Ban User",
          "unbanUser": "Unban User",
          "deleteUser": "Delete User"
        },
        "dialogs": {
          "editRole": {
            "title": "Edit User Role",
            "description": "Change the role for {{name}}",
            "currentRole": "Current Role",
            "newRole": "New Role",
            "roleOptions": {
              "admin": "Admin",
              "merchant": "Merchant",
              "model": "Model"
            }
          },
          "deleteUser": {
            "title": "Are you sure?",
            "description": "This will permanently delete the user \"{{name}}\" from the system. This action cannot be undone.",
            "confirm": "Yes, Delete User",
            "cancel": "Cancel"
          }
        },
        "toasts": {
          "loadError": "Failed to load user data",
          "banSuccess": "User banned successfully!",
          "unbanSuccess": "User unbanned successfully!",
          "roleUpdateSuccess": "User role updated successfully!",
          "deleteSuccess": "User deleted successfully!",
          "exportPreparing": "Preparing export data..."
        },
        "filters": {
          "noResults": "No users match your search criteria. Try adjusting your filters.",
          "empty": "No user accounts in the system yet."
        }
      },
        "Verifications": {
          "title": "Verification Requests Management",
          "subtitle": "Review and verify user and business identities to ensure platform security",
          "stats": {
            "total": "Total Requests",
            "pending": "Pending Review",
            "approved": "Approved",
            "rejected": "Rejected",
            "business": "Businesses",
            "individual": "Individuals"
          },
          "priorityOverview": {
            "title": "Review Priorities",
            "count": "{{count}} request(s)"
          },
          "priority": {
            "low": "Low",
            "medium": "Medium",
            "high": "High"
          },
          "status": {
            "pending": "Pending Review",
            "approved": "Approved",
            "rejected": "Rejected"
          },
          "type": {
            "individual": "Individual",
            "business": "Business"
          },
          "search": {
            "placeholder": "Search by name, email, or phone..."
          },
          "filters": {
            "status": {
              "all": "All Statuses",
              "pending": "Pending Review",
              "approved": "Approved",
              "rejected": "Rejected"
            },
            "type": {
              "all": "All Types",
              "individual": "Individuals",
              "business": "Businesses"
            },
            "priority": {
              "all": "All Priorities",
              "low": "Low",
              "medium": "Medium",
              "high": "High"
            },
            "reset": "Reset Filters"
          },
          "export": {
            "title": "Export Data"
          },
          "table": {
            "title": "Verification Requests",
            "subtitle": "View and manage all identity verification requests ({{count}} requests)",
            "count": "{{count}} request(s)",
            "headers": {
              "user": "User",
              "business": "Business",
              "type": "Type",
              "status": "Status",
              "priority": "Priority",
              "date": "Date",
              "documents": "Documents",
              "actions": "Actions"
            },
            "noResults": "No verification requests at the moment",
            "noResultsFiltered": "No requests match your search criteria"
          },
          "documents": {
            "count": "{{count}} document(s)"
          },
          "actions": {
            "review": "Review",
            "quickApprove": "Quick Approve",
            "quickReject": "Quick Reject",
            "downloadDocs": "Download Documents",
            "sendEmail": "Send Email"
          },
          "dialog": {
            "approve": {
              "title": "Confirm Approval",
              "description": "Are you sure you want to approve the verification request for {{name}}?",
              "confirm": "Confirm Approval"
            },
            "reject": {
              "title": "Confirm Rejection",
              "description": "Please specify the reason for rejecting {{name}}'s verification request",
              "reasonLabel": "Rejection Reason",
              "reasonPlaceholder": "Enter rejection reason...",
              "confirm": "Confirm Rejection"
            }
          },
          "toast": {
            "fetchSuccess": "✨ Verification requests list updated",
            "fetchError": "❌ Failed to load verification requests",
            "updating": "🔄 Processing {{action}}...",
            "updateSuccess": "✨ Request {{action}} successfully!",
            "updateError": "❌ Failed to {{action}} request",
            "exportPreparing": "📥 Preparing data export in {{format}} format..."
          }
        },
        "AdminBanners": {
          "title": "Manage Main Banners",
          "subtitle": "Manage promotional banners on the homepage",
          "form": {
            "addTitle": "Add New Banner",
            "editTitle": "Edit Banner",
            "addDescription": "Add a new banner to the homepage",
            "editDescription": "Edit the current banner details",
            "saveButton": "✨ Add Banner",
            "updateButton": "💾 Save Changes",
            "cancelEdit": "Cancel Edit"
          },
          "fields": {
            "title": "Main Title",
            "subtitle": "Subtitle",
            "badgeText": "Badge Text",
            "buttonText": "Button Text",
            "linkUrl": "Target Link",
            "isActive": "Enable Banner",
            "image": "Background Image"
          },
          "placeholders": {
            "title": "Enter an attractive main title...",
            "subtitle": "Enter a short and catchy description...",
            "badgeText": "Limited offer, featured, etc...",
            "buttonText": "Shop Now, Discover More, etc...",
            "linkUrl": "/products?category=1"
          },
          "validation": {
            "titleRequired": "Title must be at least 3 characters",
            "subtitleTooShort": "Subtitle must be at least 5 characters",
            "linkRequired": "Link is required",
            "invalidUrl": "Please enter a valid URL",
            "buttonTextRequired": "Button text is required",
            "imageType": "Please select an image file only",
            "imageSize": "Image size must be less than 5MB"
          },
          "preview": {
            "title": "Banner Preview",
            "defaultTitle": "Main Title",
            "defaultSubtitle": "Subtitle"
          },
          "list": {
            "title": "Banner List",
            "total": "{{count}} banner(s)",
            "empty": "No banners yet",
            "emptyDescription": "You haven't added any promotional banners yet",
            "loading": "Loading banners...",
            "image": "Image",
            "status": "Status",
            "dateAdded": "Date Added",
            "actions": "Actions"
          },
          "status": {
            "active": "Active",
            "inactive": "Inactive"
          },
          "actions": {
            "edit": "Edit",
            "delete": "Delete"
          },
          "deleteDialog": {
            "title": "Are you sure?",
            "description": "This will permanently delete the banner \"{{title}}\". This action cannot be undone.",
            "confirm": "Yes, Delete Banner",
            "cancel": "Cancel"
          },
          "toasts": {
            "saveSuccess": "Banner added successfully!",
            "updateSuccess": "Banner updated successfully!",
            "deleteSuccess": "Banner deleted successfully!",
            "saveError": "Failed to save banner",
            "deleteError": "Failed to delete banner",
            "loadError": "Failed to load banners"
          }
        },
    "VerificationDetails": {
        "title": "Review Request: {{name}}",
        "notFound": "No verification data found for this user.",
        "socialMedia":"Social Media",
        "followers":"Followers",
        "socialLinks":"Social Links",
        "sections": {
          "identity": {
            "title": "Identity & Business Information"
          },
          "bank": {
            "title": "Bank Details (for Dropshipping)"
          }
        },
        "fields": {
          "identityNumber": "ID Number",
          "businessName": "Business Name",
          "identityImage": "ID Image",
          "businessLicense": "Commercial Registration",
          "accountNumber": "Account Number",
          "iban": "IBAN",
          "ibanCertificate": "IBAN Certificate"
        },
        "actions": {
          "viewImage": "View Image",
          "viewDocument": "View Document",
          "viewCertificate": "View Certificate",
          "approve": "Approve & Activate Account",
          "reject": "Reject Request"
        },
        "dialog": {
          "reject": {
            "title": "Reason for Rejecting Merchant Request",
            "placeholder": "Write a clear reason for rejection to be sent to the merchant...",
            "confirm": "Confirm Rejection"
          }
        },
        "toast": {
          "fetchError": {
            "title": "Error",
            "description": "Failed to load request details."
          },
          "rejectionReasonRequired": {
            "title": "Error",
            "description": "Rejection reason is required."
          },
          "reviewSuccess": {
            "title": "Success",
            "description": "Merchant {{action}} successfully."
          },
          "reviewError": {
            "title": "Error",
            "description": "Review process failed."
          }
        }
      },
      "verification":{
        "pageTitle": "Verify Your Account",
        "pageSubtitle": "Complete verification to unlock all features",
        "personalInfo": "Personal Information",
        "idNumber": "National ID / Residence Number",
        "idPlaceholder": "Enter your ID or residence number",
        "idImage": "ID / Residence Document Image",
        "socialMedia": "Social Media Accounts",
        "followers": "Followers Count",
        "followersPlaceholder": "e.g., 10k or 150000",
        "addedPlatforms": "Added Platforms",
        "submitButton": "Submit Verification Request",
        "submitting": "Submitting...",
        "errorAllFields": "Please fill all required fields.",
        "errorDefault": "An error occurred while submitting your request.",
        "errorTitle": "Submission Failed",
        "successTitle": "Request Submitted!",
        "successMessage": "Your verification request has been received.",
        "verifiedTitle": "Account Verified",
        "verifiedSubtitle": "Your account is active and ready to use",
        "accountActive": "Account Status: Active",
        "pendingTitle": "Under Review",
        "pendingSubtitle": "We're reviewing your documents. You'll be notified soon.",
        "reviewPending": "Under Review"
      },
      "ManageProducts": {
        "title": "Manage Products",
        "subtitle": "Manage all platform products, review their status, and update their information",
        "loading": "Loading products...",
        "export": "Export Data",
        "search": {
          "placeholder": "Search by product name, brand, or merchant..."
        },
        "filters": {
          "status": {
            "all": "All Statuses",
            "active": "Active Only",
            "draft": "Draft Only",
            "archived": "Archived Only"
          },
          "category": {
            "all": "All Categories"
          }
        },
        "stats": {
          "total": "Total Products",
          "active": "Active",
          "draft": "Drafts",
          "archived": "Archived",
          "outOfStock": "Out of Stock",
          "lowStock": "Low Stock"
        },
        "status": {
          "active": "Active",
          "draft": "Draft",
          "archived": "Archived"
        },
        "statusActions": {
          "active": "activated",
          "draft": "converted to draft",
          "archived": "archived"
        },
        "inventory": {
          "outOfStock": "Out of Stock",
          "low": "Low",
          "inStock": "In Stock",
          "units": "{{count}} unit(s)"
        },
        "table": {
          "title": "Product List",
          "subtitle": "View and manage all platform products ({{count}} products)",
          "count": "{{count}} product(s)",
          "headers": {
            "product": "Product",
            "brand": "Brand",
            "merchant": "Merchant",
            "price": "Price",
            "inventory": "Inventory",
            "status": "Status",
            "date": "Date Added",
            "actions": "Actions"
          },
          "noResults": {
            "title": "No Results Found",
            "filtered": "No products match your search criteria. Try adjusting your filters.",
            "empty": "There are no products in the system yet."
          }
        },
        "actions": {
          "addProduct": "Add Product",
          "view": "View Product",
          "edit": "Edit Product",
          "activate": "Activate Product",
          "toDraft": "Convert to Draft",
          "archive": "Archive Product",
          "delete": "Delete Product"
        },
        "fields": {
          "name": "Product Name",
          "brand": "Brand",
          "status": "Current Status"
        },
        "dialog": {
          "edit": {
            "title": "Edit Product",
            "description": "Edit product information for {{name}}",
            "save": "Save Changes"
          },
          "delete": {
            "title": "Are you sure?",
            "description": "The product \"{{name}}\" will be permanently deleted from the system.",
            "warning": "This action cannot be undone.",
            "confirm": "Yes, Delete Product"
          }
        },
        "toast": {
          "fetchError": "❌ Failed to load product data",
          "updatingStatus": "🔄 Updating product status...",
          "updateSuccess": "✨ Product {{action}} successfully!",
          "updateError": "❌ Failed to update product status",
          "deleting": "🔄 Deleting product...",
          "deleteSuccess": "🗑️ Product deleted successfully!",
          "deleteError": "❌ Failed to delete product",
          "exportPreparing": "📥 Preparing data export..."
        }
      },
      
      "ManageCategories": {
        "title": "Manage Categories",
        "subtitle": "Create and edit your store's product category structure in an organized and easy way.",
        "loading": "Loading categories...",
        "search": {
          "placeholder": "Search categories..."
        },
        "actions": {
          "addCategory": "Create New Category"
        },
        "tree": {
          "title": "Category Tree",
          "productsCount": "{{count}} product(s)"
        },
        "form": {
          "fields": {
            "name": {
              "label": "Category Name",
              "placeholder": "e.g., Electronics"
            },
            "parent": {
              "label": "Parent Category (Optional)",
              "placeholder": "Select a parent category...",
              "root": "-- Root Category --"
            },
            "description": {
              "label": "Description"
            },
            "image": {
              "label": "Category Image",
              "uploadPrompt": "Click to upload image"
            },
            "sortOrder": {
              "label": "Display Order"
            },
            "status": {
              "label": "Status"
            }
          },
          "errors": {
            "nameRequired": "❌ Category name is required."
          },
          "actions": {
            "create": "🚀 Create Category",
            "update": "💾 Save Changes"
          }
        },
        "dialog": {
          "create": {
            "title": "Create New Category"
          },
          "edit": {
            "title": "Edit Category"
          },
          "delete": {
            "title": "Are you sure?",
            "description": "The category \"{{name}}\" and all its subcategories will be permanently deleted.",
            "warning": "This action cannot be undone.",
            "confirm": "Yes, Delete Category"
          }
        },
        "toast": {
          "fetchError": "❌ Failed to load categories.",
          "saving": "🔄 Saving category...",
          "saveSuccess": "✨ Category {{action}} successfully!",
          "saveError": "❌ Failed to {{action}} category.",
          "deleting": "🔄 Deleting category...",
          "deleteSuccess": "🗑️ Category deleted successfully.",
          "deleteError": "❌ Failed to delete category."
        }
      },
      "Analytics": {
        "title": "Performance Analytics",
        "subtitle": "Deep insights into your store's performance over the last 30 days.",
        "dailySalesSummary": "Daily Sales Summary",
        "salesDescription": "Completed sales (in SAR)",
        "sales": "Sales",
        "loading": "Loading analytics data..."
      },
      "OrderDetails": {
        "loading": "Loading order details...",
        "notFound": {
          "title": "Order Not Found",
          "description": "The requested order does not exist or is inaccessible"
        },
        "backToOrders": "Back to Orders",
        "title": "Order Details #{{id}}",
        "subtitle": "View and manage all order details and update its status",
        "toast": {
          "fetchError": "❌ Failed to load order details.",
          "noChange": "Order status has not been changed.",
          "updateSuccess": "✨ Order status updated successfully!",
          "updateError": "❌ Failed to update order status."
        },
        "statusCard": {
          "title": "Order Status",
          "description": "Track and update the current order status",
          "current": "Current Status",
          "placeholder": "Select new status",
          "updating": "Updating...",
          "update": "Update Status"
        },
        "productsCard": {
          "title": "Ordered Products",
          "description": "List of all products in this order",
          "quantity": "{{count}} item",
          "quantity_plural": "{{count}} items",
          "unitPrice": "Unit price: {{price}}"
        },
        "customerCard": {
          "title": "Customer Information",
          "name": "Customer Name",
          "email": "Email Address",
          "phone": "Phone Number"
        },
        "summaryCard": {
          "title": "Order Summary",
          "orderDate": "Order Date",
          "totalItems": "{{count}} product",
          "totalItems_plural": "{{count}} products",
          "items": "Total Products",
          "totalAmount": "Total Amount"
        },
        "shippingCard": {
          "title": "Shipping Address",
          "address": "Delivery Address"
        },
        "status": {
          "pending": "Pending",
          "processing": "Processing",
          "shipped": "Shipped",
          "completed": "Completed",
          "cancelled": "Cancelled"
        }
      },
      "Products": {
        "title": "Manage Products",
        "addProduct": "Add New Product",
        "productName": "Product Name",
        "price": "Price",
        "stockQuantity": "Stock Quantity",
        "actions": "Actions",
        "loading": "Loading products...",
        "noProducts": "No products found.",
        "addNewProduct": "Add New Product",
        "editProduct": "Edit Product",
        "deleteConfirm": {
            "title": "Are you absolutely sure?",
            "description": "This action cannot be undone. This will permanently delete the product.",
            "cancel": "Cancel",
            "confirm": "Yes, delete it"
        }
      },
      "ProductsPage": {
        "title": "Product Management",
        "subtitle": "Manage your products and variants easily",
        "addProduct": "Add New Product",
        "loading": "Loading products...",
        "stats": {
          "totalProducts": "Total Products",
          "activeProducts": "Active Products",
          "variants": "Variants",
          "lowStock": "Low Stock"
        },
        "status": {
          "active": "Active",
          "draft": "Draft"
        },
        "stock": {
          "outOfStock": "Out of Stock",
          "lowStock": "Low Stock",
          "inStock": "In Stock"
        },
        "variants": "Variants",
        "variant": {
          "color": "Color",
          "price": "Price",
          "stock": "Stock",
          "sku": "SKU",
          "images": "Images",
          "noImages": "No images"
        },
        "empty": {
          "title": "No products yet",
          "subtitle": "Start by creating your first product in the store",
          "createFirst": "Create First Product"
        },
        "createProduct": "Create New Product",
        "editProduct": "Edit Product",
        "deleteFailed": "Failed to delete product.",
        "confirmDelete": {
          "title": "Are you sure you want to delete?",
          "message": "This will permanently delete the product \"{{name}}\" and all its variants.",
          "confirm": "Yes, Delete Product"
        }
      },
      "AgreementRequests": {
        "title": "Incoming Collaboration Requests",
        "subtitle": "Review collaboration requests from merchants and accept or reject them.",
        "merchantName": "Merchant Name",
        "offerTitle": "Requested Offer",
        "productName": "Product",
        "status": {
            "label": "Status",
            "pending": "Pending",
            "accepted": "Accepted",
            "rejected": "Rejected",
            "completed": "Completed"
        },
        "actions": "Actions",
        "accept": "Accept",
        "reject": "Reject",
        "loading": "Loading requests...",
        "noRequests": "No requests found.",
        "alerts": {
            "success": "Request {{action}} successfully!",
            "accepted": "accepted",
            "rejected": "rejected",
            "error": "Failed to update request status."
        }
      },
      "OfferForm": {
        "title": "Offer Title",
        "description": "Description",
        "price": "Price",
        "offerType": "Offer Type",
        "offerTypePlaceholder": "Choose type...",
        "offerTypes": {
            "story": "Story",
            "post": "Post",
            "reels": "Reels",
            "photoshoot": "Photoshoot"
        },
        "saving": "Saving...",
        "saveChanges": "Save Changes",
        "createOffer": "Create Offer",
        "errors": {
            "saveFailed": "Failed to save the offer. Please ensure all fields are filled."
        }
      },
      "MerchantDashboard": {
        "loading": "Loading dashboard...",
        "errors": {
          "loadFailed": "Failed to load dashboard data."
        },
        "welcomeBack": "Welcome back! 👋",
        "storeSummary": "Here's a summary of your store's performance today",
        "stats": {
          "totalSales": "Total Sales",
          "averageRating": "Average Rating",
          "fromReviews": "from {{count}} reviews",
          "monthlyViews": "Monthly Views",
          "activeProducts": "Active Products",
          "newOrders": "New Orders"
        },
        "salesSummary": "Sales Summary",
        "salesPerformance": "View sales performance for the selected period",
        "thisWeek": "This Week",
        "thisMonth": "This Month",
        "recentOrders": "Recent Orders",
        "lastOrders": "Last {{count}} orders received",
        "noRecentOrders": "No recent orders",
        "viewAllOrders": "View all orders",
        "orderNumber": "Order #{{id}}"
      },
      "modelrequests": {
        "pageTitle": "Collaboration Requests",
        "pageSubtitle": "Review incoming collaboration requests from merchants and manage them easily",

        "stats": {
          "total": "Total Requests",
          "pending": "Pending Review",
          "inProgress": "In Progress",
          "completed": "Completed"
        },

        "filters": {
          "searchPlaceholder": "Search by merchant, product, or package...",
          "statusFilter": "Filter by status",
          "reset": "Reset"
        },

        "status": {
          "all": "All Requests",
          "pending": "Pending Approval",
          "accepted": "Accepted",
          "in_progress": "In Progress",
          "completed": "Completed",
          "rejected": "Rejected"
        },

        "empty": {
          "title": "No Collaboration Requests",
          "descriptionDefault": "When a merchant sends a collaboration request, it will appear here for review.",
          "descriptionFiltered": "We couldn’t find any requests matching your search. Try adjusting your filters.",
          "showAll": "Show All Requests"
        },

        "card": {
          "package": "Service Package",
          "product": "Product",
          "features": "Included Features",
          "additionalFeatures": "+{{count}} more features",
          "unlimited": "Unlimited",
          "reviews": "Revisions",
          "days": "Days",
          "priceCurrency": "SAR"
        },

        "actions": {
          "accept": "Accept Request",
          "reject": "Reject",
          "start": "Start Execution",
          "complete": "Complete Request"
        },

        "rejectDialog": {
          "title": "Reason for Rejection",
          "description": "Please specify why you're rejecting the collaboration request from {{merchantName}}",
          "reasons": {
            "busy": "I'm currently busy",
            "not_suitable": "Not aligned with my expertise",
            "timing": "Timing doesn't work for me",
            "budget": "Budget is not suitable",
            "other": "Other reason"
          },
          "placeholderOther": "Please explain the reason...",
          "cancel": "Cancel",
          "confirm": "Confirm Rejection"
        },

        "toasts": {
          "loading": "🔄 Updating request status...",
          "success": "✨ Request updated successfully!",
          "error": "❌ Failed to update the request."
        }
      },
      "ProductCard": {
        "by": "by",
        "viewDetails": "View Details",
        "save": "Save",
        "reviews": "Reviews",
        "moreOptions": "More Options"
      },
      "ProductDetail": {
        "loading": "Loading...",
        "notFound": "Product not found.",
        "productImagePlaceholder": "Product Image",
        "by": "by",
        "stockQuantity": "Remaining Quantity",
        "addToCart": "Add to Cart"
      },
      "CartPage": {
        "title": "Shopping Cart",
        "itemsCount": "{{count}} item(s) in your cart",
        "emptyTitle": "Your cart is empty",
        "emptyDescription": "It's empty here! Why not browse our amazing products?",
        "continueShopping": "Continue Shopping",
        "byMerchant": "by {{merchant}}",
        "orderSummary": "Order Summary",
        "subtotal": "Subtotal",
        "shipping": "Shipping",
        "shippingTBD": "To be determined",
        "total": "Total",
        "checkoutButton": "Proceed to Checkout",
        "processing": "Processing..."
      },
  "ProfilePage": {
    "title": "My Profile",
    "subtitle": "Manage your personal information and preferences",
    "tabs": {
      "personal": "Personal Info",
      "contact": "Contact Info",
      "addresses": "Addresses",
      "security": "Security"
    },
    "fields": {
      "fullName": "Full Name",
      "email": "Email Address",
      "phone": "Phone Number",
      "shippingAddress": "Shipping Address"
    },
    "passwordInstructions": "Leave fields blank to keep your current password.",
    "newPassword": "New Password",
    "confirmPassword": "Confirm New Password",
    "saveChanges": "Save Changes",
    "saving": "Saving...",
    "passwordMismatch": "Passwords do not match.",
    "updateSuccess": "Profile updated successfully!",
    "updateError": "Failed to update profile.",
  "toasts": {
    "saving": "Saving...",
    "addressSaved": "Address saved successfully!",
    "loadAddressesError": "Failed to load addresses.",
    "invalidImage": "Please upload a valid image file.",
    "fileTooLarge": "File must be less than 5MB.",
    "uploading": "Uploading...",
    "pictureUpdated": "Profile picture updated!",
    "addressDeleted": "Address deleted successfully!"
  },
  "addressForm": {
    "addTitle": "Add New Address",
    "editTitle": "Edit Address",
    "address": "Address Line 1",
    "addressPlaceholder": "e.g. 123 Main St",
    "addressRequired": "Address is required",
    "city": "City",
    "cityRequired": "City is required",
    "state": "State / Province",
    "stateRequired": "State is required",
    "postalCode": "Postal Code",
    "postalCodeRequired": "Postal code is required",
    "country": "Country",
    "countryRequired": "Country is required",
    "isDefault": "Set as default shipping address"
  },
  "addressList": {
    "title": "Saved Addresses",
    "description": "Manage your delivery addresses",
    "addNew": "Add Address",
    "addFirst": "Add Your First Address",
    "empty": "You haven’t added any addresses yet.",
    "default": "Default"
  },
  "deleteDialog": {
    "title": "Delete Address?",
    "description": "This action cannot be undone. Are you sure you want to delete this address?"
  },
},

      "MyOrdersPage": {
        "title": "My Orders",
        "subtitle": "Track all your past and current orders",
        "back": "Back",
        "exportOrders": "Export Orders",
        "stats": {
          "total": "Total Orders",
          "pending": "Pending",
          "shipped": "Shipped",
          "completed": "Completed"
        },
        "orderHistory": "Order History",
        "orderHistoryDescription": "View and track all your orders in one place",
        "table": {
          "orderId": "Order ID",
          "orderDate": "Order Date",
          "status": "Status",
          "itemsCount": "Items",
          "total": "Total",
          "actions": "Actions"
        },
        "tracking": "Tracking",
        "itemsCount": "{{count}} item(s)",
        "viewDetails": "View Details",
        "noOrders": {
          "title": "No orders yet",
          "description": "You haven't placed any orders yet",
          "browseProducts": "Browse Products"
        },
        "statusLegend": {
          "title": "Order Status Guide"
        }
      },
      "OrderDetailsPage": {
        "loading": "Loading order details...",
        "notFound": "Order not found",
        "backToOrders": "Back to Orders",
        "orderTitle": "Order #{{id}}",
        "share": "Share",
        "downloadInvoice": "Download Invoice",
        "orderItems": {
          "title": "Ordered Items",
          "itemPrice": "{{quantity}} × {{price}} {{currency}}",
          "reviewButton": "Review Product"
        },
        "summary": {
          "title": "Order Summary",
          "subtotal": "Subtotal",
          "shipping": "Shipping",
          "tax": "Tax",
          "total": "Final Total"
        },
        "shipping": {
          "title": "Shipping Address",
          "noAddress": "No shipping address specified"
        },
        "support": {
          "title": "Need Help?",
          "description": "Our support team is ready to assist you with any inquiry",
          "contactButton": "Contact Support"
        },
        "status": {
          "pending": "Pending",
          "processing": "Processing",
          "shipped": "Shipped",
          "completed": "Completed",
          "cancelled": "Cancelled"
        },
        "timeline": {
          "title": "Order Tracking",
          "pending": {
            "label": "Pending",
            "description": "Your order has been received"
          },
          "processing": {
            "label": "Processing",
            "description": "Preparing your order"
          },
          "shipped": {
            "label": "Shipped",
            "description": "Your order is on its way"
          },
          "completed": {
            "label": "Completed",
            "description": "Order delivered"
          }
        },
        "reviewForm": {
          "dialogTitle": "Product Review",
          "title": "Product Review",
          "ratingPrompt": "How would you rate this product?",
          "selectStars": "Select stars",
          "yourRating": "Your rating: {{rating}} out of 5",
          "commentLabel": "Add a comment (optional):",
          "commentPlaceholder": "Share your experience with this product...",
          "submitButton": "Submit Review",
          "submitting": "Submitting...",
          "selectRating": "Please select a rating",
          "success": "Thank you! Your review has been added! 🌟",
          "error": "Failed to add review. Please try again."
        }
      },
      "WishlistPage": {
        "title": "Wishlist",
        "subtitle": "Products you've saved for later purchase.",
        "loading": "Loading wishlist...",
        "empty": {
          "title": "Your wishlist is empty",
          "description": "Start browsing our luxury collection and save your favorites to come back to them later.",
          "browseProducts": "Browse Products Now"
        }
      },
      
      "CustomerDashboard": {
        "welcome": "Welcome, {{name}}!",
        "subtitle": "Here you can see a summary of your activity on Linora platform",
        "viewDetails": "View Details",
        "latestOrder": {
          "title": "Your Latest Order",
          "orderId": "Order #{{id}}",
          "noOrders": "You haven't placed any orders yet",
          "shopNow": "Shop Now"
        },
        "quickActions": {
          "title": "Quick Actions",
          "myOrders": "My Orders",
          "wishlist": "Wishlist",
          "profile": "My Profile"
        }
      },
      "AdminMessagesPage": {
        "title": "Conversation Monitoring",
        "subtitle": "Monitor and oversee all conversations between models and merchants",
        "conversations": {
          "title": "Conversations",
          "subtitle": "Active discussions",
          "searchPlaceholder": "Search conversations...",
          "empty": {
            "title": "No Conversations",
            "noResults": "No conversations match your search.",
            "noConversations": "No active conversations yet."
          },
          "withMerchant": "with {{merchant}}"
        },
        "messages": {
          "selectPrompt": "Select a Conversation",
          "empty": {
            "title": "No Messages",
            "noMessages": "No messages in this conversation yet.",
            "selectConversation": "Select a conversation from the sidebar to view messages."
          }
        },
        "roles": {
          "model": "Model",
          "merchant": "Merchant"
        },
        "monitoring": "Monitoring",
        "monitoring.info": "You are monitoring this conversation. Messages cannot be sent in monitoring mode."
      },
      "AdminNav": {
        "title":"Admin Dashboard Controller",
        "nav": {
          "overview": "Overview",
          "users": "Users",
          "messages":"Messages",
          "Footer":"Footer-setting",
          "marquee-bar":"marquee Bar",
          "main-banners": "Main Banners",
          "verification": "Verifications",
          "products": "Products",
          "categories": "Categories",
          "orders": "Orders",
          "agreements": "Agreements",
          "subscriptions": "Subscriptions",
          "shipping": "Shipping",
          "payouts": "Payouts",
          "model payouts": "Model Payouts",
          "Promotions": "Promotions",
          "Manage-Subscriptions": "Manage Subscriptions",
          "Content": "Content",
          "settings": "Settings"
        },
      },
      "common": {
      "currency": "SAR",
      "retry": "Retry",
      "active":"Active",
      "refresh": "Refresh",
      "visible": "Visible",
      "preview": "Preview",
      "promote": "Promote",
      "hidden": "Hidden",
      "exportData":"Export Data",
      "users":"Users",
      "system": "System",
      "back":"Back",
        "locale": "en-US",
        "uploading": "Uploading...",
        "saving": "Saving...",
        "edit": "Edit",
        "delete": "Delete",
        "cancel": "Cancel",
        "subscriptionStatus": {
          "active": "Active",
          "cancelled": "Cancelled",
          "inactive": "Inactive"
        }
    },
    "MerchantAgreements": {
      "title": "My Agreements",
      "subtitle": "Manage and track all your collaboration agreements with models and influencers",
      "loading": "Loading agreements...",
      "export": "Export Data",
      "search": {
        "placeholder": "Search by model name or offer title..."
      },
      "stats": {
        "total": "Total Agreements",
        "pending": "Pending Approval",
        "accepted": "In Progress",
        "completed": "Completed",
        "totalValue": "Total Value"
      },
      "status": {
        "pending": "Pending Approval",
        "accepted": "In Progress",
        "rejected": "Rejected",
        "completed": "Completed"
      },
      "empty": {
        "title": "No Agreements Found",
        "filtered": "No agreements match your search criteria",
        "noData": "You haven't created any agreements yet",
        "clearSearch": "Clear Search"
      },
      "table": {
        "title": "Agreement List",
        "description": "Manage and track all your collaboration agreements ({{count}} agreements)",
        "count": "{{count}} agreement(s)",
        "headers": {
          "model": "Model/Influencer",
          "offer": "Offer",
          "status": "Status",
          "value": "Value",
          "actions": "Actions"
        }
      },
      "actions": {
        "confirmCompletion": "Confirm Completion",
        "completing": "Completing...",
        "details": "Details"
      },
      "dialog": {
        "review": {
          "title": "Rate Collaboration",
          "description": "Rate your collaboration with {{name}}",
          "ratingLabel": "How would you rate this work?",
          "ratingValue": "{{count}} out of 5 stars",
          "commentLabel": "Additional comment (optional)",
          "commentPlaceholder": "Describe your experience, strengths, or any other feedback...",
          "confirm": "Confirm Completion",
          "confirming": "Confirming..."
        }
      },
      "toast": {
        "fetchError": "❌ Failed to load agreements",
        "exportPreparing": "📥 Preparing data export...",
        "ratingRequired": "Please select a rating (at least one star).",
        "completing": "🔄 Completing agreement and saving review...",
        "completeSuccess": "✨ Agreement completed and reviewed successfully!",
        "completeError": "❌ Operation failed. Please try again.",
        "unexpectedError": "❌ An unexpected error occurred."
      },
      "rating": {
        "star": "{{count}} star"
      }
    },
    "StoreSettings": {
      "title": "Store Settings",
      "subtitle": "Manage your store's basic information and preferences.",
      "storeName": "Store Name",
      "storeDescription": "Store Description",
      "saveChanges": "Save Changes",
      "saveSuccess": "Settings saved successfully!",
      "saveError": "Failed to save settings.",
      "loading": "Loading settings..."
    },
    "SettingsPage": {
      "exportData": "Export Data",
      "tabs": {
        "general": "General",
        "store": "Store",
        "social": "Social",
        "notifications": "Notifications",
        "privacy": "Privacy",
        "subscription": "Subscription"
      },
      "descriptions": {
        "general": "Manage your basic account settings",
        "store": "Customize your store and how it appears to customers",
        "social": "Link your social media accounts",
        "notifications": "Control your notifications and alerts",
        "privacy": "Privacy and security settings",
        "subscription": "Manage your subscription and plans"
      },
      "fields": {
        "language": "Language",
        "currency": "Currency",
        "storeBanner": "Store Banner"
      },
      "languageOptions": {
        "ar": "العربية",
        "en": "English"
      },
      "currencyOptions": {
        "sar": "Saudi Riyal (SAR)",
        "usd": "US Dollar (USD)"
      },
      "upload": {
        "dropOrClick": "Drag & drop image here or click to select",
        "changeImage": "Change Image",
        "failed": "Failed to upload banner."
      },
      "socialPlaceholders": {
        "instagram": "https://instagram.com/username",
        "twitter": "https://x.com/username",
        "facebook": "https://facebook.com/username"
      },
      "notifications": {
        "email": "Email",
        "emailDesc": "Email notifications",
        "push": "Push Notifications",
        "pushDesc": "App notifications",
        "sms": "SMS",
        "smsDesc": "Text message alerts"
      },
      "privacy": {
        "showEmail": "Show Email",
        "showEmailDesc": "Allow others to see your email",
        "showPhone": "Show Phone",
        "showPhoneDesc": "Allow others to see your phone number"
      },
      "subscription": {
        "month": "month",
        "startDate": "Start Date",
        "endDate": "End Date",
        "noActive": "No active subscription",
        "upgradePrompt": "Subscribe to one of our plans to unlock advanced features",
        "viewPlans": "View Plans",
        "cancelButton": "Cancel Subscription",
        "cancelFailed": "Failed to cancel subscription.",
        "cancelConfirm": {
          "title": "Are you sure you want to cancel?",
          "description": "This will cancel auto-renewal. Your features will remain available until the end of your current billing period.",
          "confirm": "Yes, Cancel"
        }
      }
    },
    "PromotionTiersPage": {
    "title": "Manage Promotion Tiers",
    "subtitle": "Create and manage product promotion packages with different priority levels.",
    "sort": {
      "placeholder": "Sort by",
      "priority": "Priority",
      "name": "Name",
      "price": "Price"
    },
    "view": {
      "grid": "Grid",
      "table": "Table"
    },
    "actions": {
      "createTier": "Create Tier",
      "saving": "Saving...",
      "updateTier": "Update Tier"
    },
    "stats": {
      "totalTiers": "Total Tiers",
      "activeTiers": "Active Tiers",
      "highestPrice": "Highest Price",
      "maxPriority": "Max Priority"
    },
    "common": {
      "unnamed": "Unnamed Tier"
    },
    "tier": {
      "priority": "Priority",
      "duration": "Duration",
      "price": "Price",
      "features": "Features",
      "days_one": "{{count}} day",
      "days_other": "{{count}} days"
    },
    "table": {
      "name": "Name",
      "status": "Status",
      "duration": "Duration",
      "price": "Price",
      "priority": "Priority",
      "color": "Color",
      "actions": "Actions"
    },
    "form": {
      "createTitle": "Create Promotion Tier",
      "editTitle": "Edit Promotion Tier",
      "createSubtitle": "Create a new promotion tier for product boosting.",
      "editSubtitle": "Update the promotion tier details.",
      "nameLabel": "Tier Name",
      "namePlaceholder": "e.g., Gold Tier, Premium Boost",
      "durationLabel": "Duration (days)",
      "priceLabel": "Price ({{currency}})",
      "priorityLabel": "Priority",
      "priorityHint": "Higher number means higher visibility in promotions",
      "descriptionLabel": "Description",
      "descriptionPlaceholder": "Brief description of this tier's benefits...",
      "featuresLabel": "Features",
      "featurePlaceholder": "Add a feature...",
      "badgeColorLabel": "Badge Color",
      "activeLabel": "Active Tier"
    },
    "confirmDelete": {
      "title": "Are you sure?",
      "description": "This action cannot be undone. This will permanently delete the \"{{name}}\" promotion tier and remove all associated data.",
      "confirm": "Delete Tier"
    },
    "toast": {
      "fetchError": "Failed to fetch promotion tiers.",
      "deleteSuccess": "Tier deleted successfully!",
      "deleteError": "Failed to delete tier.",
      "statusUpdated": "Tier {{status}}",
      "statusError": "Failed to update tier status.",
      "updateSuccess": "Tier updated successfully!",
      "createSuccess": "Tier created successfully!",
      "saveError": "An error occurred."
    }
  },
    "ModelNav": {
        "nav": {
          "overview": "Overview",
          "offers": "My Offers",
          "requests": "Requests",
          "reels":"Reels",
          "wallet": "Wallet",
          "verification": "Verification",
          "mySubscription": "My Subscription",
          "subscribe":"Subscribe",
          "profile": "Edit Profile",
          "messages": "Messages",
          "analytics": "Analytics",
          "settings": "Settings"
        }
    },
    "ProductForm": {
    "basicInfo": {
      "title": "Basic Information",
      "subtitle": "Enter the basic product information"
    },
    "fields": {
      "productName": "Product Name",
      "brand": "Brand",
      "description": "Description",
      "status": "Product Status"
    },
    "status": {
      "active": "Active",
      "draft": "Draft"
    },
    "statusDescription": "Enable product to show in store",
    "variants": {
      "title": "Variants & Colors",
      "subtitle": "Add different product variants (colors, prices, stock)",
      "variantNumber": "Variant #{{number}}"
    },
    "variantFields": {
      "color": "Color",
      "sku": "SKU",
      "price": "Price ({{currency}})",
      "comparePrice": "Compare Price ({{currency}})",
      "stock": "Stock Quantity",
      "images": "Variant Images",
      "variantImageAlt": "Product variant image"
    },
    "placeholders": {
      "productName": "Enter product name...",
      "brand": "Brand (optional)",
      "description": "Enter detailed product description...",
      "color": "e.g., Red, Blue, etc...",
      "sku": "Will be auto-generated",
      "price": "e.g., 199.99",
      "comparePrice": "e.g., 249.99 (optional)",
      "stock": "e.g., 50"
    },
    "addVariant": "Add New Variant (Color)",
    "addImage": "Add Image",
    "uploading": "Uploading...",
    "saving": "Saving...",
    "createProduct": "Create Product",
    "updateProduct": "Save Changes",
    "uploadFailed": "Image upload failed.",
    "saveFailed": "Failed to save product."
  },
  "DropshippingPage": {
    "title": "Dropshipping Products",
    "subtitle": "Choose from thousands of ready-to-sell products and add them to your store with one click",
    "stats": {
      "totalProducts": "Total Products",
      "featured": "Featured Products",
      "suppliers": "Suppliers",
      "totalValue": "Total Value"
    },
    "search": {
      "placeholder": "Search by product name, brand, or category..."
    },
    "filters": {
      "allCategories": "All Categories",
      "clear": "Clear Filters"
    },
    "actions": {
      "export": "Export Data",
      "refresh": "Refresh",
      "addToStore": "Add to Store",
      "importing": "Importing..."
    },
    "results": {
      "product_one": "product",
      "product_other": "products"
    },
    "loading": "Loading products...",
    "currency": "SAR",
    "badge": {
      "featured": "Featured"
    },
    "product": {
      "supplier": "Supplier"
    },
    "empty": {
      "title": "No Products Found",
      "noProducts": "No products are currently available",
      "noResults": "No products match your search criteria",
      "viewAll": "View All Products"
    },
    "gate": {
      "title": "This Feature Is Exclusive to Subscribers",
      "description": "To access dropshipping products and start selling instantly, please subscribe to a plan that supports this service.",
      "action": "View Subscription Plans"
    },
    "success": {
      "import": "Product successfully imported to your store!"
    },
    "errors": {
      "fetchFailed": "Failed to load dropshipping products.",
      "importFailed": "Failed to import product. It may already exist in your store."
    },
    "info": {
      "exporting": "Preparing export data..."
    }
  },
  "TrendsPage": {
    "search": {
      "placeholder": "Search trends...",
      "clear": "Clear search"
    },
    "filters": {
      "title": "Filters & Sort",
      "quick": "Quick Filters"
    },
    "sort": {
      "title": "Sort By",
      "placeholder": "Sort by",
      "popular": "Most Popular",
      "newest": "New Arrivals",
      "priceLow": "Price: Low to High",
      "priceHigh": "Price: High to Low"
    },
    "view": {
      "title": "View Mode"
    },
    "badges": {
      "newArrivals": "New Arrivals",
      "under50": "Under 50 ر.س"
    },
    "results": {
      "showing": "Showing {{current}} of {{total}} products",
      "footer": "Showing {{current}} of {{total}} trending products"
    },
    "empty": {
      "title": "No products found",
      "noResults": "No results for \"{{query}}\". Try adjusting your search.",
      "noTrends": "No trending products available at the moment."
    },
    "loadMore": "Load More Trends"
  },
  "MessagesPage": {
    "title": "Messages",
    "conversations": "Conversations",
    "loadingConversations": "Loading conversations...",
    "noConversations": "No conversations yet.",
    "online": "Online now",
    "lastSeen": {
      "label": "Last seen",
      "unknown": "Unknown"
    },
    "loadingMessages": "Loading messages...",
    "messagePlaceholder": "Write your message...",
    "sendMessageFailed": "Failed to send message.",
    "fileUploadFailed": "Failed to upload file.",
    "attachment": "Attachment",
    "attachmentImageAlt": "Attached image",
    "attachmentFile": "Attached file",
    "selectConversation": "Select a conversation",
    "selectConversationHint": "to view messages or start a new chat."
  },
  "ModelReelsPage": {
    "title": "My Reels",
    "subtitle": "Manage and showcase your video content with beautiful reels",
    "loading": "Loading your reels...",
    "stats": {
      "totalReels": "{{count}} {{count, plural, one {Reel} other {Reels}}} Total",
      "activeReels": "{{count}} Active"
    },
    "actions": {
      "uploadNew": "Upload New Reel"
    },
    "manage": {
      "title": "Manage Your Videos",
      "subtitle": "View, edit, and manage all your uploaded reels in one place"
    },
    "empty": {
      "title": "No Reels Yet",
      "subtitle": "You haven't uploaded any reels yet. Start creating amazing content to share with your audience!",
      "uploadFirst": "Upload Your First Reel"
    },
    "table": {
      "preview": "Preview",
      "details": "Caption & Details",
      "performance": "Performance",
      "status": "Status",
      "actions": "Actions"
    },
    "reel": {
      "thumbnailAlt": "Reel thumbnail",
      "noCaption": "(No caption)"
    },
    "performance": {
      "views": "views",
      "likes": "likes"
    },
    "confirmDelete": {
      "title": "Delete Reel?",
      "description": "This action cannot be undone. This will permanently delete your reel and all its data from our servers.",
      "confirm": "Delete Reel"
    },
    "editReel": {
      "title": "Edit Reel"
    },
    "toast": {
      "fetchError": "Failed to fetch your reels.",
      "deleteSuccess": "Reel deleted successfully",
      "deleteError": "Failed to delete reel",
      "updateSuccess": "Reel updated successfully!"
    }
  },
  "MarqueeBarPage": {
    "title": "Marquee Bar Manager",
    "subtitle": "Create and manage scrolling announcements for your platform",
    
    "toast": {
      "fetchError": "Failed to fetch messages",
      "emptyMessage": "Please enter a message",
      "tooLong": "Message must be under 200 characters",
      "addSuccess": "Message added successfully",
      "addError": "Failed to add message",
      "statusUpdated": "Message {{status}}",
      "updateError": "Failed to update status",
      "deleteSuccess": "Message deleted successfully",
      "deleteError": "Failed to delete message"
    },
    "confirm": {
      "delete": "Are you sure you want to delete this message? This action cannot be undone."
    },
    "stats": {
      "total": "Total Messages",
      "active": "Active Messages",
      "inactive": "Inactive Messages"
    },
    "speedCard":{
      "title":"Animation Speed",
      "subtitle": "Control the duration of the scroll (in seconds). Lower is faster.",
      "hint":"Recommended: 15-30 seconds. Minimum: 5 seconds.",
    },
    "addCard": {
      "title": "Add New Message",
      "subtitle": "Create engaging announcements that will scroll across the platform",
      "placeholder": "✨ New Summer Collection! Shop now and get 20% off...",
      "hint": "Use emojis to make it engaging",
      "adding": "Adding...",
      "add": "Add Message"
    },
    "listCard": {
      "title": "Current Messages",
      "subtitle": "{{count}} message{{count, plural, one {} other {s}}} in total",
      "activeBadge": "{{count}} Active",
      "empty": {
        "title": "No Messages Yet",
        "subtitle": "Start by creating your first marquee message to engage with your audience."
      },
      "chars": "{{count}} characters"
    },
    "bestPractices": {
      "title": "Best Practices",
      "bullet1": "Keep messages short and engaging (under 100 characters)",
      "bullet2": "Use emojis to grab attention",
      "bullet3": "Activate only 2-3 messages at a time for better readability",
      "bullet4": "Update messages regularly to keep content fresh"
    }
  },
  "AdminProductsPage": {
    "title": "Product Management",
    "subtitle": "View and manage all products on the platform.",
    "productsList": "Product List",
    "foundProducts": "{{count}} products found",
    "searchPlaceholder": "Search by name or merchant...",
    "loading": "Loading...",
    "noProducts": "No products found.",
    "table": {
      "product": "Product",
      "merchant": "Merchant",
      "status": "Status",
      "variants": "Variants",
      "actions": "Actions"
    },
    "status": {
      "active": "Active",
      "draft": "Draft"
    },
    "actions": {
      "view": "View Product",
      "activate": "Activate Product",
      "deactivate": "Deactivate Product",
      "delete": "Delete Product"
    },
    "confirmDelete": {
      "title": "Are you sure you want to delete?",
      "message": "The product \"{{name}}\" will be permanently deleted. This action cannot be undone.",
      "confirm": "Yes, Delete"
    },
    "statusUpdateFailed": "Failed to update product status.",
    "deleteFailed": "Failed to delete product."
  },
  "AdminOrdersPage": {
    "title": "Order Management",
    "subtitle": "Monitor all orders and transactions on the platform.",
    "loading": "Loading...",
    "loadingDetails": "Loading details...",
    "detailsLoadFailed": "Failed to load order details.",
    "noOrders": "No matching orders found.",
    "orderList": "Order Log",
    "foundOrders": "{{count}} matching orders",
    "searchPlaceholder": "Search...",
    "filterByStatus": "Filter by Status",
    "status": {
      "all": "All",
      "pending": "Pending",
      "processing": "Processing",
      "shipped": "Shipped",
      "completed": "Completed",
      "cancelled": "Cancelled"
    },
    "table": {
      "orderNumber": "Order #",
      "customer": "Customer",
      "date": "Date",
      "status": "Status",
      "total": "Total",
      "actions": "Actions"
    },
    "stats": {
      "totalOrders": "Total Orders",
      "completedOrders": "Completed Orders",
      "pendingOrders": "Pending Orders",
      "totalRevenue": "Total Revenue"
    },
    "orderDetails": "Order Details #{{id}}",
    "customerInfo": "Customer: {{name}} ({{email}})",
    "products": "Products",
    "total": "Total"
  },
  "AdminAgreements": {
    "title": "Manage Agreements",
    "subtitle": "View and track all collaboration agreements on the platform",
    "stats": {
      "total": "Total Agreements",
      "pending": "Pending Approval",
      "accepted": "In Progress",
      "completed": "Completed",
      "revenue": "Total Revenue"
    },
    "status": {
      "pending": "Pending Approval",
      "accepted": "In Progress",
      "rejected": "Rejected",
      "completed": "Completed"
    },
    "card": {
      "package": "Service Package",
      "product": "Linked Product",
      "price": "Package Value"
    },
    "empty": {
      "title": "No Agreements Found",
      "description": "No collaboration agreements have been created yet. They will appear here once the first agreement is created."
    },
    "toast": {
      "fetchError": "❌ Failed to load agreements"
    }
  },
  "PayoutsPage": {
    "title": "Pending Payout Requests",
    "table": {
      "requestId": "Request ID",
      "merchant": "Merchant",
      "amount": "Amount",
      "date": "Request Date",
      "empty": "No pending payout requests at the moment."
    },
    "dialog": {
      "title": "Payout Request Details #{{id}}",
      "description": "Review the merchant's banking details before taking action.",
      "merchantInfo": "Merchant Information",
      "bankInfo": "Banking Information",
      "name": "Name",
      "type": "Type",
      "email": "Email",
      "phone": "Phone Number",
      "accountNumber": "Account Number",
      "iban": "IBAN",
      "viewIbanCertificate": "View IBAN Certificate",
      "notAvailable": "Not available"
    },
    "actions": {
      "approve": "Approve",
      "reject": "Reject"
    },
    "prompt": {
      "rejectionReason": "Please specify the rejection reason (optional):"
    },
    "notes": {
      "approved": "Approved and paid",
      "rejectedNoReason": "Rejected without specified reason"
    },
    "toast": {
      "fetchError": "Failed to fetch payout requests.",
      "detailsError": "Failed to load request details.",
      "updateSuccess": "Request #{{id}} updated successfully.",
      "updateError": "Failed to update request #{{id}}."
    }
  },
  "EditReelForm": {
    "preview": {
      "title": "Reel Preview",
      "alt": "Reel thumbnail",
      "views": "{{count}} views",
      "noCaption": "No caption yet..."
    },
    "caption": {
      "label": "Caption",
      "placeholder": "Share your story, describe your style, or add a catchy caption...",
      "chars": "{{current}}/{{max}} characters"
    },
    "taggedProducts": {
      "title": "Tagged Products",
      "count": "{{count}}",
      "tagProducts": "Tag Products",
      "manageProducts": "Manage Tagged Products",
      "activeAgreements": "Active Agreements",
      "fromMerchant": "From: {{store}}",
      "allProducts": "All Products"
    },
    "validation": {
      "maxCaption": "Caption must be at most 1000 characters"
    },
    "actions": {
      "saving": "Saving Changes...",
      "saveChanges": "Save Changes"
    },
    "toast": {
      "fetchError": "Could not load products or agreements.",
      "updateSuccess": "Reel updated successfully!",
      "updateError": "Update failed"
    }
  },
  "AdminSubscriptions": {
    "title": "Manage Subscriptions",
    "subtitle": "Manage and track all user subscriptions on the platform",
    "loading": "Loading subscriptions...",
    "export": "Export Data",
    "search": {
      "placeholder": "Search by name or email..."
    },
    "filters": {
      "status": {
        "all": "All Statuses",
        "active": "Active Only",
        "cancelled": "Cancelled Only"
      }
    },
    "stats": {
      "total": "Total Subscriptions",
      "active": "Active",
      "cancelled": "Cancelled",
      "mrr": "Monthly Recurring Revenue"
    },
    "status": {
      "active": "Active",
      "cancelled": "Cancelled"
    },
    "table": {
      "title": "Subscription Records",
      "subtitle": "View and manage all user subscriptions ({{count}} subscriptions)",
      "count": "{{count}} subscription(s)",
      "headers": {
        "user": "User",
        "plan": "Plan Type",
        "status": "Status",
        "startDate": "Start Date",
        "endDate": "End Date",
        "actions": "Actions"
      },
      "empty": {
        "title": "No Subscriptions Found",
        "filtered": "No subscriptions match your search criteria.",
        "noData": "There are no subscriptions in the system yet."
      }
    },
    "actions": {
      "cancelRenewal": "Cancel Renewal",
      "deleteRecord": "Delete Record"
    },
    "dialog": {
      "cancel": {
        "title": "Confirm Cancellation",
        "description": "Automatic renewal for {{name}}'s subscription will be cancelled.",
        "confirm": "Confirm Cancellation"
      },
      "delete": {
        "title": "Confirm Record Deletion",
        "description": "{{name}}'s subscription record will be permanently deleted.",
        "warning": "This action cannot be undone.",
        "confirm": "Yes, Delete Record"
      }
    },
    "toast": {
      "fetchError": "❌ Failed to load subscriptions",
      "cancelling": "🔄 Cancelling renewal...",
      "cancelSuccess": "✅ Renewal cancelled successfully",
      "cancelError": "❌ Failed to cancel renewal",
      "deleting": "🔄 Deleting record...",
      "deleteSuccess": "🗑️ Record deleted successfully",
      "deleteError": "❌ Failed to delete record",
      "exportPreparing": "📥 Preparing data export..."
    }
  },
   "AdminPromotions": {
    "title": "Product Promotion Management",
    "subtitle": "Manage promotion packages and approve merchant requests",
    "stats": {
      "totalRequests": "Total Requests",
      "pendingRequests": "Pending Requests",
      "approvedRequests": "Approved Requests",
      "totalTiers": "Promotion Tiers",
      "activeTiers": "Active Tiers",
      "totalRevenue": "Total Revenue"
    },
    "searchPlaceholder": "Search by product, merchant, or tier...",
    "actions": {
      "export": "Export Data",
      "refresh": "Refresh"
    },
    "tabs": {
      "requests": "Promotion Requests ({{count}})",
      "tiers": "Promotion Tiers ({{count}})"
    },
    "requests": {
      "title": "Pending Promotion Requests",
      "description": "These requests are awaiting your approval after the merchant has paid ({{count}} request)",
      "description_plural": "These requests are awaiting your approval after the merchant has paid ({{count}} requests)",
      "table": {
        "product": "Product",
        "merchant": "Merchant",
        "tier": "Tier",
        "price": "Price",
        "status": "Status",
        "date": "Request Date",
        "actions": "Actions"
      },
      "noRequests": "No Requests Found",
      "noResults": "No requests match your search criteria",
      "empty": "No pending promotion requests at the moment",
      "loading": "Loading promotion requests...",
      "activate": "Activate",
      "viewDetails": "View Details"
    },
    "tiers": {
      "title": "Promotion Tiers Management",
      "description": "Manage the tiers merchants can purchase ({{count}} tier)",
      "description_plural": "Manage the tiers merchants can purchase ({{count}} tiers)",
      "createNew": "Create New Tier",
      "editTier": "Edit Tier",
      "createFirst": "Create First Tier",
      "noTiers": "No Tiers Found",
      "empty": "No promotion tiers created yet",
      "loading": "Loading promotion tiers...",
      "duration": "{{count}} day",
      "duration_plural": "{{count}} days",
      "priceLabel": "Price",
      "durationLabel": "Duration",
      "activateLabel": "Enable Tier"
    },
    "form": {
      "tierName": "Tier Name",
      "tierNamePlaceholder": "Enter tier name (e.g., Gold Promotion)",
      "durationDays": "Duration (in days)",
      "durationPlaceholder": "7",
      "priceSAR": "Price (SAR)",
      "pricePlaceholder": "99.99",
      "saveTier": "Save Tier"
    },
    "status": {
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected"
    },
    "toast": {
      "fetchError": "❌ Failed to load promotion data.",
      "createTierSuccess": "✅ Tier created successfully.",
      "createTierError": "❌ Failed to create tier.",
      "updateTierSuccess": "✅ Tier updated successfully.",
      "updateTierError": "❌ Failed to update tier.",
      "approveRequestSuccess": "✅ Request approved and activated.",
      "approveRequestError": "❌ Failed to approve request.",
      "exportPreparing": "📥 Preparing export data..."
    }
  },
  "AdminSettings": {
    "title": "Platform Settings",
    "subtitle": "Manage and customize your platform settings easily and securely",
    "loading": "Loading settings...",
    "sections": "Sections",
    "nav": {
      "financial": "Financial Settings",
      "payments": "Payment Gateways",
      "apis": "API Keys",
      "general": "General Settings"
    },
    "financial": {
      "title": "Financial Settings",
      "description": "Manage commissions, fees, and financial settings for the platform",
      "commissionRate": {
        "label": "Sales Commission (%)",
        "description": "The percentage the platform takes from each sale"
      },
      "shippingCommission": {
        "label": "Shipping Commission (%)",
        "description": "The percentage the platform takes from each shipping transaction"
      },
      "agreementCommission": {
        "label": "Model Agreement Commission (%)",
        "description": "The percentage the platform takes from each completed agreement between merchant and model"
      },
      "dropshippingPrice": {
        "label": "Dropshipping Price (SAR)",
        "description": "The fixed price for the basic dropshipping service"
      },
      "payoutClearingDays": {
        "label": "Payout Clearing Period (Days)",
        "description": "Number of days earnings remain pending before becoming withdrawable",
        "unit": "days"
      }
    },
    "payments": {
      "title": "Payment Gateways",
      "description": "Stripe payment gateway settings for secure transactions",
      "stripePublishable": {
        "label": "Stripe Publishable Key",
        "description": "The key used in the frontend for secure transactions"
      },
      "stripeSecret": {
        "label": "Stripe Secret Key",
        "description": "The secret key used in the backend for secure transactions"
      }
    },
    "apis": {
      "title": "API Keys",
      "description": "Manage third-party service API keys integrated with the platform",
      "resend": {
        "label": "Resend API Key",
        "description": "The key used to send emails via Resend service"
      },
      "cloudinary": {
        "label": "Cloudinary Settings",
        "description": "Settings for image and video storage and processing service",
        "cloudNamePlaceholder": "Cloud name",
        "apiKeyPlaceholder": "API Key",
        "apiSecretPlaceholder": "API Secret"
      }
    },
    "general": {
      "title": "General Settings",
      "description": "Basic settings and overall appearance of the platform",
      "platformName": {
        "label": "Platform Name",
        "description": "The name displayed to users across the platform"
      },
      "platformDescription": {
        "label": "Platform Description",
        "description": "A brief description explaining the platform's purpose and nature"
      },
      "maintenanceMode": {
        "label": "Maintenance Mode",
        "description": "Enable maintenance mode to temporarily disable the platform for maintenance",
        "activeBadge": "Platform under maintenance"
      }
    },
    "actions": {
      "save": "Save Settings",
      "saving": "Saving..."
    },
    "toast": {
      "fetchError": "❌ Failed to load settings",
      "saveSuccess": "✨ Settings saved successfully",
      "saveError": "❌ Failed to save settings"
    }
  },
  "checkout": {
    "title": "Checkout",
    "subtitle": "Review your order and complete your purchase",
    "orderSummary": "Order Summary",
    "paymentMethod": "Payment Method",
    "creditCard": "Credit/Debit Card",
    "cod": "Cash on Delivery",
    "securePayment": "Secure Payment",
    "payOnDelivery": "Pay when your order arrives",
    "paymentSummary": "Payment Summary",
    "subtotal": "Subtotal",
    "shipping": "Shipping",
    "free": "Free",
    "tax": "Tax",
    "included": "Included",
    "shippingMethod": "Shipping Method",
    "selectShippingMethod":"Select Shipping Method",
    "total": "Total",
    "secure": "Secure",
    "encrypted": "Encrypted",
    "proceedToPayment": "Proceed to Payment",
    "placeOrder": "Place Order",
    "poweredByStripe": "Powered by Stripe",
    "cashOnDelivery": "Cash on Delivery",
    "freeShipping": "Free Shipping",
    "secureCheckout": "Secure Checkout",
    "guarantee": "Money-Back Guarantee",
    "processing": "Processing...",
    "paymentFailed": "Payment failed. Please try again.",
    "shippingAddress": "Shipping Address",
    "selectShippingAddress": "Select or add a shipping address",
    "addNewAddress": "Add New Address",
    "selectAddressError": "No shipping address selected",
    "selectAddressErrorDesc": "Please select or add a shipping address to continue."
  },
  "errors": {
    "fetchAddressesFailed": "Failed to load addresses"
  },
  "VerificationsPage": {
    "title": "Merchant Verification Requests",
    "description": "Review new merchant requests and approve or reject them",
    "actions": {
      "refresh": "Refresh",
      "export": "Export",
      "review": "Review",
      "quickApprove": "Quick Approve",
      "quickReject": "Quick Reject",
      "viewDetails": "View Details",
      "downloadDocs": "Download Documents",
      "resetFilters": "Reset Filters"
    },
    "search": {
      "placeholder": "Search by name or email..."
    },
    "filters": {
      "all": "All"
    },
    "status": {
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected"
    },
    "stats": {
      "total": "Total Requests",
      "pending": "Pending Review",
      "approved": "Approved",
      "rejected": "Rejected"
    },
    "table": {
      "title": "Verification Requests List",
      "subtitle": "{{filtered}} requests out of {{total}}",
      "merchant": "Merchant",
      "business": "Business",
      "type": "Type",
      "status": "Status",
      "date": "Submission Date",
      "actions": "Actions",
      "individual": "Individual",
      "noResults": "No matching results found",
      "empty": "No verification requests at the moment"
    },
    "type": {
      "business": "Business",
      "individual": "Individual"
    }
  },
  "ModelProfile": {
    "loading": "Loading profile...",
    "notFound": {
      "title": "Model Not Found",
      "description": "The model may not be available at this time"
    },
    "role": {
      "model": "Fashion Model",
      "influencer": "Influencer"
    },
    "experience": "{{years}} years of experience",
    "defaultBio": "A talented model with extensive experience in fashion and marketing.",
    "actions": {
      "startConversation": "Start Conversation",
      "creatingChat": "Creating conversation...",
      "bookCampaign": "Book Campaign"
    },
    "stats": {
      "title": "Statistics",
      "followers": "Followers",
      "engagement": "Engagement",
      "responseTime": "Response Time",
      "completionRate": "Completion Rate",
      "completedCampaigns": "Completed Campaigns"
    },
    "social": {
      "title": "Social Media"
    },
    "languages": "Languages",
    "tabs": {
      "portfolio": "Portfolio",
      "packages": "Packages",
      "offers": "Offers"
    },
    "portfolio": {
      "empty": {
        "title": "No Portfolio Images",
        "description": "The model hasn't added any portfolio images yet"
      }
    },
    "packages": {
      "empty": {
        "title": "No Packages Available",
        "description": "The model hasn't created any service packages yet"
      },
      "delivery": "Delivery in {{days}} days",
      "unlimitedRevisions": "Unlimited revisions",
      "revisions": "{{count}} revisions",
      "select": "Select Package"
    },
    "offers": {
      "empty": {
        "title": "No Offers Available",
        "description": "The model hasn't created any special offers yet"
      },
      "request": "Request Offer"
    },
    "dialog": {
      "offer": {
        "title": "Confirm Offer Request",
        "productLabel": "Select product to promote",
        "productPlaceholder": "Choose a product from your list",
        "confirm": "Proceed to Payment",
        "processing": "Redirecting to payment..."
      },
      "package": {
        "title": "Confirm Package: {{tier}}",
        "description": "A payment of {{amount}} will be reserved. Select a product to begin.",
        "productLabel": "Select product to promote",
        "productPlaceholder": "Choose a product from your list",
        "confirm": "Proceed to Payment",
        "processing": "Redirecting to payment..."
      }
    },
    "toast": {
      "fetchError": "❌ Failed to load model data",
      "offerProductRequired": "❌ Please select a product first",
      "packageProductRequired": "❌ Please select a product first",
      "paymentFailed": "❌ Unable to access payment page",
      "checkoutError": "❌ Error creating offer request",
      "packageCheckoutError": "❌ Error creating package request",
      "conversationError": "❌ Failed to start conversation",
      "comingSoon": "🚀 Direct booking feature coming soon!",
      "linkCopied": "✅ Profile link copied"
    }
  },
  "UploadReelPage": {
    "title": "Upload New Reel",
    "subtitle": "Share your style with the world through beautiful video content",
    "form": {
      "title": "Create New Reel",
      "subtitle": "Upload your video and add engaging details"
    },
    "video": {
      "label": "Video File",
      "selectPrompt": "Select a video file",
      "supportedFormats": "MP4, MOV, MKV, AVI supported"
    },
    "preview": {
      "title": "Preview",
      "placeholder": "Video preview will appear here"
    },
    "caption": {
      "label": "Caption",
      "placeholder": "Share your story, describe your style, or add a catchy caption...",
      "chars": "{{current}}/{{max}} characters"
    },
    "taggedProducts": {
      "title": "Tagged Products",
      "count": "{{count}} Products",
      "tagProducts": "Tag Products",
      "manageProducts": "Manage Tagged Products",
      "activeAgreements": "Active Agreements",
      "fromMerchant": "From: {{store}}",
      "allProducts": "All Products"
    },
    "agreement": {
      "linked": "Linked to Active Agreement",
      "id": "This reel will be associated with Agreement ID: {{id}}"
    },
    "actions": {
      "uploading": "Uploading...",
      "uploadReel": "Upload Reel"
    },
    "validation": {
      "videoRequired": "Video file is required.",
      "maxCaption": "Caption must be at most 1000 characters"
    },
    "toast": {
      "fetchError": "Could not load products or active agreements.",
      "uploadSuccess": "Video uploaded successfully!",
      "uploadError": "Upload failed"
    }
  },
  "ShippingPage": {
  "title": "Shipping Companies Management",
  "subtitle": "Manage your store's shipping companies, costs, and delivery times",
  "stats": {
    "total": "Total Companies",
    "active": "Active Companies",
    "averageCost": "Avg. Cost",
    "totalCost": "Total Costs"
  },
  "search": {
    "placeholder": "Search by company name or delivery time..."
  },
  "actions": {
    "export": "Export Data",
    "refresh": "Refresh",
    "addCompany": "Add Company"
  },
  "dialog": {
    "createTitle": "Add New Shipping Company",
    "editTitle": "Edit Shipping Company"
  },
  "form": {
    "name": {
      "label": "Shipping Company Name",
      "placeholder": "Enter shipping company name"
    },
    "cost": {
      "label": "Shipping Cost (SAR)"
    },
    "deliveryTime": {
      "label": "Delivery Time",
      "placeholder": "e.g., 3-5 business days"
    }
  },
  "table": {
    "title": "Shipping Companies",
    "subtitle": "Manage all available shipping companies ({{count}} companies)",
    "companies": "companies",
    "headers": {
      "company": "Company",
      "cost": "Shipping Cost",
      "deliveryTime": "Delivery Time",
      "status": "Status",
      "dateAdded": "Date Added",
      "actions": "Actions"
    }
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "activated": "activated",
    "deactivated": "deactivated"
  },
  "empty": {
    "title": "No Shipping Companies",
    "noCompanies": "You haven't added any shipping companies yet",
    "noResults": "No companies match your search criteria"
  },
  "loading": "Loading shipping companies...",
  "currency": "SAR",
  "success": {
    "create": "Shipping company added successfully!",
    "update": "Shipping company updated successfully!",
    "delete": "Shipping company deleted successfully!",
    "toggleStatus": "Shipping company {{action}} successfully!"
  },
  "errors": {
    "fetchFailed": "Failed to load shipping companies",
    "saveFailed": "Failed to save data",
    "deleteFailed": "Failed to delete shipping company",
    "toggleFailed": "Failed to update status",
    "missingFields": "Please fill in all required fields"
  },
  "info": {
    "exporting": "Preparing export data..."
  },
  "delete": {
    "confirmTitle": "Confirm Deletion",
    "confirmMessage": "Are you sure you want to delete the shipping company \"{{name}}\"?"
  },
  "defaults": {
    "deliveryTime": "3-5 business days"
  }
  },
  "WalletPage": {
    "title": "Financial Wallet",
    "description": "Manage your funds, track transactions, and withdrawal requests",
    "actions": {
      "downloadStatement": "Download Statement"
    },
    "tabs": {
      "overview": "Overview",
      "transactions": "Transaction History"
    },
    "stats": {
      "availableBalance": "Available Balance",
      "availableBalanceDesc": "Amount available for immediate withdrawal",
      "pendingEarnings": "Pending Earnings",
      "pendingEarningsDesc": "Earnings from orders in transit",
      "totalEarnings": "Total Earnings",
      "totalEarningsDesc": "Total earnings since you started",
      "lastPayout": "Last Payout",
      "lastPayoutDesc": "Last successful withdrawal"
    },
    "payout": {
      "title": "New Withdrawal Request",
      "description": "Enter the amount you wish to withdraw from your available balance. Your request will be reviewed within 3 business days.",
      "minAmountNotice": "Minimum withdrawal amount is {{minAmount}} SAR",
      "amountLabel": "Requested Amount (SAR)",
      "amountPlaceholder": "Enter amount, e.g., 500",
      "confirmButton": "Confirm Withdrawal",
      "processing": "Processing...",
      "availableBalance": "Available Balance",
      "requestedAmount": "Requested Amount",
      "insufficientBalance": "Requested amount exceeds available balance"
    },
    "info": {
      "title": "Important Information",
      "security": {
        "title": "Full Security",
        "description": "Your transactions are protected and secured"
      },
      "processingTime": {
        "title": "3 Business Days",
        "description": "Withdrawal request processing time"
      },
      "minAmount": {
        "title": "{{minAmount}} SAR Minimum",
        "description": "Minimum amount for withdrawal request"
      }
    },
    "transactions": {
      "title": "Transaction History",
      "description": "All your withdrawals and deposits in your wallet",
      "empty": "No transactions yet",
      "emptyDescription": "Your transactions will appear here once you make your first transaction"
    },
    "transactionType": {
      "payout": "Withdrawal",
      "earning": "Earnings",
      "refund": "Refund"
    },
    "transactionStatus": {
      "completed": "Completed",
      "pending": "Pending Review",
      "failed": "Failed"
    },
    "toast": {
      "fetchWalletError": {
        "title": "Failed to load wallet data",
        "description": "Could not fetch wallet data. Please try again."
      },
      "invalidAmount": {
        "title": "Invalid amount",
        "description": "Please enter a valid amount greater than zero."
      },
      "insufficientBalance": {
        "title": "Insufficient balance",
        "description": "The requested amount exceeds your available wallet balance."
      },
      "minPayout": {
        "title": "Minimum withdrawal",
        "description": "Minimum withdrawal amount is {{minAmount}} SAR."
      },
      "payoutSuccess": {
        "title": "Request submitted successfully",
        "description": "Your withdrawal request will be reviewed within 3 business days."
      },
      "payoutError": {
        "title": "Failed to submit request",
        "description": "Could not submit withdrawal request. Please try again."
      }
    }
  },
  "AdminModelPayouts": {
  "title": "Model Payout Requests",
  "subtitle": "Review and manage payout requests from models on the platform.",
  "table": {
    "model": "Model",
    "email": "Email",
    "amount": "Amount",
    "status": "Status",
    "date": "Request Date",
    "actions": "Actions",
    "viewDetails": "View Details",
    "approve": "Approve",
    "reject": "Reject"
  },
  "stats": {
    "totalRequests": "Total Requests",
    "pendingRequests": "Pending Requests",
    "approvedRequests": "Approved Requests",
    "rejectedRequests": "Rejected Requests",
    "pendingAmount": "Pending Amount"
  },
  "status": {
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected"
  },
  "dialog": {
    "title": "Payout Request Details",
    "requestAmount": "Payout request for {{amount}} {{currency}}",
    "modelInfo": "Model Information",
    "requestDate": "Request Date"
  },
  "actions": {
    "exportData": "Export Data",
    "refresh": "Refresh"
  },
  "search": {
    "placeholder": "Search by name or email..."
  },
  "empty": {
    "noRequests": "No payout requests found.",
    "noResults": "No requests match your search criteria."
  },
  "loading": "Loading payout requests...",
  "toast": {
    "fetchError": "Failed to load payout requests.",
    "updateSuccess": "Request updated successfully!",
    "updateError": "Failed to update request status."
  }
},
"AdminShipping": {
    "title": "Shipping Management",
    "subtitle": "Manage your shipping providers, API keys, and activation status from one central dashboard.",
    "stats": {
      "totalCompanies": "Total Companies",
      "activeCompanies": "Active Companies"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive"
    },
    "filters": {
      "all": "All"
    },
    "searchPlaceholder": "Search by company name...",
    "actions": {
      "refresh": "Refresh",
      "export": "Export",
      "addCompany": "Add Company"
    },
    "shippingCompanies": "Shipping Companies",
    "foundCompanies": "{{count}} company found",
    "foundCompanies_plural": "{{count}} companies found",
    "table": {
      "companyName": "Company Name",
      "apiKey": "API Key",
      "status": "Status",
      "actions": "Actions",
      "notAvailable": "Not available",
      "noResults": "No companies match your search or filter.",
      "empty": "No shipping companies added yet."
    },
    "noCompanies": "No Companies Found",
    "loading": "Loading shipping companies...",
    "addNewCompany": "Add New Company",
    "editCompany": "Edit Company",
    "form": {
      "name": "Company Name",
      "apiKey": "API Key (Optional)",
      "active": "Active Status"
    },
    "toast": {
      "fetchError": {
        "title": "Failed to load shipping companies."
      },
      "saveError": {
        "title": "Failed to save company."
      },
      "addSuccess": {
        "title": "Company added successfully!"
      },
      "updateSuccess": {
        "title": "Company updated successfully!"
      },
      "statusUpdateFailed": "Failed to update company status."
    }
  },
  "ContentManagement": {
    "title": "Platform Content Management",
    "subtitle": "Edit and manage user-facing content with an elegant, feminine touch",
    "loading": "Loading content...",
    "export": "Export Data",
    "search": {
      "placeholder": "Search by section name or key..."
    },
    "stats": {
      "total": "Total Sections",
      "visible": "Visible Sections",
      "hidden": "Hidden Sections"
    },
    "sections": {
      "about": "About Us",
      "terms": "Terms",
      "privacy": "Privacy",
      "help": "Help",
      "contact": "Contact"
    },
    "sidebar": {
      "title": "Content Sections",
      "description": "Manage all platform content sections ({{count}} sections)",
      "empty": {
        "title": "No Sections Found",
        "filtered": "No sections match your search criteria",
        "noData": "No content sections available yet"
      }
    },
    "editor": {
      "title": "Edit Content",
      "empty": {
        "title": "Select a Section to Edit",
        "description": "Choose an item from the sidebar to start editing and managing content"
      },
      "fields": {
        "title": "Title",
        "titlePlaceholder": "Enter title here...",
        "content": "Content",
        "contentPlaceholder": "Write section content here...",
        "htmlNote": "You can use HTML formatting for advanced content",
        "visibility": {
          "label": "Show Content to Users",
          "visible": "Content is visible to everyone",
          "hidden": "Content is currently hidden"
        }
      }
    },
    "actions": {
      "save": "Save Changes",
      "saving": "Saving..."
    },
    "toast": {
      "fetchListError": "❌ Failed to load content list",
      "fetchDetailsError": "❌ Failed to load content details",
      "updateSuccess": "✨ Content updated successfully",
      "updateError": "❌ Error occurred during update",
      "exportPreparing": "📥 Preparing data export..."
    }
  },
  "ModelDashboard": {
    "loading": "Loading dashboard...",
    "unauthorized": {
      "title": "Access Denied",
      "description": "Please log in to access your dashboard"
    },
    "welcome": "Welcome, {{name}}!",
    "subtitle": "Here's a summary of your performance, collaboration requests, and an overview of your activity on the platform",
    "stats": {
      "totalEarnings": "Total Earnings",
      "totalEarningsDesc": "All your earnings so far",
      "monthlyEarnings": "This Month's Earnings",
      "monthlyEarningsDesc": "Compared to last month",
      "completedAgreements": "Completed Collaborations",
      "completedAgreementsDesc": "Successful deals",
      "pendingRequests": "New Requests",
      "pendingRequestsDesc": "Awaiting review"
    },
    "secondaryStats": {
      "profileViews": "Profile Views",
      "responseRate": "Response Rate",
      "upcomingCollaborations": "Upcoming Collaboration",
      "rating": "Customer Rating"
    },
    "quickActions": {
      "title": "Quick Actions",
      "description": "Manage your account and activities quickly and easily",
      "requests": "Collaboration Requests",
      "offers": "Service Packages",
      "analytics": "Analytics",
      "wallet": "Wallet"
    },
    "recentActivity": {
      "title": "Recent Activity",
      "description": "Latest updates and activities on your account",
      "empty": "No recent activity"
    },
    "performance": {
      "title": "Performance Overview",
      "description": "Track your progress and performance this month",
      "completionRate": "Task Completion Rate",
      "customerSatisfaction": "Customer Satisfaction",
      "deliverySpeed": "Delivery Speed",
      "encouragement": {
        "title": "You're on the right track! 🎯",
        "description": "Your performance is better than 80% of models on the platform"
      }
    },
    "cta": {
      "title": "🚀 Ready to get started?",
      "description": "Enhance your profile and attract more opportunities",
      "profile": "Enhance Profile",
      "createOffers": "Create New Packages"
    },
    "toast": {
      "fetchError": "❌ Failed to load dashboard data.",
      "agreementAccepted": "✨ Thank you for accepting the agreement",
      "agreementError": "❌ An error occurred, please try again"
    }
  },
  "AdminSubscriptionPlans": {
    "title": "Subscription Plans Management",
    "subtitle": "Manage and customize subscription plans for merchants, models, and influencers",
    "stats": {
      "totalPlans": "Total Plans",
      "activePlans": "Active Plans",
      "merchantPlans": "Merchant Plans",
      "modelPlans": "Model Plans",
      "influencerPlans": "Influencer Plans",
      "totalValue": "Total Value"
    },
    "searchPlaceholder": "Search by plan name, role, or description...",
    "actions": {
      "export": "Export Data",
      "refresh": "Refresh",
      "newPlan": "New Plan",
      "saveChanges": "Save Changes",
      "createPlan": "Create Plan"
    },
    "common": {
      "plans": "{{count}} plan",
      "plans_plural": "{{count}} plans"
    },
    "plans": {
      "title": "Subscription Plans",
      "description": "Manage all available subscription plans on the platform ({{count}} plan)",
      "description_plural": "Manage all available subscription plans on the platform ({{count}} plans)",
      "loading": "Loading subscription plans...",
      "noPlans": "No Plans Found",
      "noResults": "No plans match your search criteria",
      "empty": "No subscription plans currently available"
    },
    "table": {
      "planName": "Plan Name",
      "role": "Role",
      "price": "Price",
      "features": "Features",
      "status": "Status",
      "actions": "Actions",
      "moreFeatures": "+{{count}} more"
    },
    "roles": {
      "merchant": "Merchant",
      "model": "Model",
      "influencer": "Influencer"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive"
    },
    "form": {
      "planName": "Plan Name",
      "planNamePlaceholder": "e.g., Professional Plan",
      "role": "Role",
      "rolePlaceholder": "Select role",
      "price": "Price (SAR)",
      "pricePlaceholder": "0.00",
      "description": "Description",
      "descriptionPlaceholder": "Optional plan description...",
      "features": "Features",
      "featuresPlaceholder": "Feature 1, Feature 2, ...",
      "featuresHint": "Separate features with commas.",
      "includesDropshipping": "Includes Dropshipping",
      "isActive": "Plan is Active"
    },
    "dialog": {
      "editTitle": "Edit Plan",
      "createTitle": "Create New Plan"
    },
    "toast": {
      "fetchError": "❌ Failed to load subscription plans.",
      "nameTooShort": "❌ Plan name must be at least 3 characters.",
      "invalidPrice": "❌ Price must be a valid positive number.",
      "updating": "🔄 Updating plan...",
      "creating": "🔄 Creating plan...",
      "updateSuccess": "✅ Plan updated successfully!",
      "createSuccess": "✅ Plan created successfully!",
      "saveError": "❌ An error occurred while saving the plan.",
      "exportPreparing": "📥 Preparing export data..."
    }
  },
  "CategorySlider": {
    "title": "Shop by Category",
    "viewAll":"View All",
  },
  "PromotedProducts": {
    "featured": {
      "title": "Featured Products",
      "subtitle": "Most requested this week",
      "viewAll": "View all featured products"
    },
    "discounts": {
      "title": "Big Discounts",
      "subtitle": "Save up to 70%",
      "fast": "Fast",
      "save": "Save {{percent}}%",
      "viewAll": "View all offers"
    },
    "mainPromotion": {
      "fallbackTitle": "Summer Mega Sale",
      "fallbackSubtitle": "Get the best deals on featured products with discounts up to 70%",
      "fallbackButton": "Discover Offers",
      "fallbackBadge": "Limited Offer"
    }
  },
  "productDetail": {
    "breadcrumb": {
      "products": "Products"
    },
    "byMerchant": "by {{merchant}}",
    "selectColor": "Select Color",
    "quantity": "Quantity",
    "addToCart": "Add to Cart",
    "inStock": "In Stock ({{count}} pcs)",
    "outOfStock": "Out of Stock",
    "discount": "{{percent}}% OFF",
    "saveAmount": "Save {{amount}}",
    "features": {
      "fastShipping": "Fast shipping within 24-48 hours",
      "freeReturn": "Free returns within 30 days",
      "qualityGuarantee": "Quality and authenticity guaranteed"
    },
    "reviews": {
      "title": "Customer Reviews",
      "ratingCount": "ratings",
      "outOf": "out of {{count}} reviews",
      "noReviews": {
        "title": "No reviews yet",
        "description": "Be the first to review this product!"
      },
      "anonymous": "User"
    },
    "notFound": {
      "title": "Product Not Found",
      "description": "Sorry, we couldn't find the product you're looking for.",
      "browseProducts": "Browse Products"
    },
    "toast": {
      "fetchError": "❌ Failed to load product data",
      "addToCartSuccess": "🛒 Product added to cart!",
      "addToWishlist": "❤️ Added to wishlist",
      "removeFromWishlist": "Removed from wishlist",
      "wishlistError": "❌ Error updating wishlist",
      "unexpectedError": "❌ Unexpected error occurred",
      "shareSuccess": "Product shared successfully",
      "copyLinkSuccess": "Product link copied"
    }
  },
  "BrowseModels": {
    "title": "Browse Models",
    "subtitle": "Discover exceptional talent and find the perfect model for your next project",
    "loading": "Loading models...",
    "search": {
      "placeholder": "Search by name, specialty, or bio..."
    },
    "filters": {
      "category": {
        "label": "Specialty",
        "all": "All"
      },
      "sort": {
        "label": "Sort By",
        "name": "Name",
        "rating": "Rating",
        "followers": "Followers"
      }
    },
    "results": {
      "count": "Showing <span class=\"font-bold text-rose-800\">{{count}}</span> models",
      "updated": "List updated now"
    },
    "empty": {
      "title": "No models found",
      "description": "Try adjusting your search terms or filters to find more models",
      "reset": "Show All"
    },
    "badges": {
      "featured": "Featured",
      "verified": "Verified"
    },
    "role": {
      "model": "Fashion Model",
      "influencer": "Influencer"
    },
    "defaultBio": "A talented model with experience in fashion and advertising.",
    "stats": {
      "followers": "Followers",
      "engagement": "Engagement",
      "rating": "Rating"
    },
    "actions": {
      "viewProfile": "View Profile"
    }
  },
    "payment":{
      "card": "Credit/Debit Card",
      "cod": "Cash on Delivery"
    },
  "Orders": {
    "title": "Order Management",
    "subtitle": "Manage and track all customer orders easily",
    "searchPlaceholder": "Search by order ID, customer name, or product...",
    "actions": {
      "export": "Export Data",
      "refresh": "Refresh",
      "newOrder": "New Order"
    },
    "filters": {
      "all": "All Statuses",
      "allOrders": "All Orders"
    },
    "clearFilters": "Clear Filters",
    "loading": "Loading orders...",
    "noOrders": "No Orders Found",
    "noResults": "No orders match your search criteria",
    "empty": "No orders currently available",
    "stats": {
      "total": "Total Orders",
      "pending": "Pending Orders",
      "completed": "Completed Orders",
      "cancelled": "Cancelled Orders",
      "totalRevenue": "Total Revenue"
    },
    "status": {
      "pending": "Pending",
      "completed": "Completed",
      "cancelled": "Cancelled"
    },
    "table": {
      "title": "Order List",
      "description": "{{count}} order",
      "description_plural": "{{count}} orders",
      "orderId": "Order ID",
      "customer": "Customer",
      "date": "Order Date",
      "status": "Status",
      "amount": "Amount",
      "actions": "Actions"
    },
    "common": {
      "orders": "{{count}} order",
      "orders_plural": "{{count}} orders"
    },
    "viewDetails": "View Details",
    "toast": {
      "fetchError": "❌ Failed to load orders",
      "exportPreparing": "📥 Preparing export data..."
    }
  },
  "merchantDashboard": {
    "loading": "Loading dashboard...",
    "retry": "Retry",
    "error": {
      "fetchFailed": "Failed to load dashboard data."
    },
    "agreement": {
      "accepted": "Thank you for accepting the agreement!",
      "error": "An error occurred, please try again."
    },
    "welcome": "Welcome, {{name}}!",
    "welcomeSubtitle": "Here's a summary of your store's performance.",
    "stats": {
      "totalSales": "Total Sales",
      "averageRating": "Average Rating",
      "fromReviews": "from {{count}} reviews",
      "monthlyViews": "Monthly Views",
      "activeProducts": "Active Products",
      "newOrders": "New Orders"
    },
    "chart": {
      "title": "Sales Summary",
      "description": "Your sales performance for the selected period",
      "thisWeek": "This Week",
      "thisMonth": "This Month",
      "sales": "Sales",
      "date": "{{date}}"
    },
    "orders": {
      "title": "Recent Orders",
      "recent": "Last {{count}} orders",
      "noRecent": "No recent orders",
      "viewAll": "View All Orders",
      "orderNumber": "Order #{{id}}",
      "status": {
        "completed": "Completed",
        "pending": "Pending",
        "cancelled": "Cancelled"
      }
    },
    "verification": {
      "pending": {
        "title": "Your account is under review",
        "description": "We've received your documents and will review them soon. You'll be notified via email."
      },
      "rejected": {
        "title": "There's an issue with your account verification"
      },
      "notSubmitted": {
        "title": "Your account is awaiting verification"
      },
      "actionRequired": "You must verify your account to add products and start selling.",
      "goToVerification": "Click here to go to the verification page."
    },
    "onboarding": {
      "title": "Welcome to Linora!",
      "description": "Complete your account verification to access the full dashboard and start your journey as a merchant."
    }
  },

  "OffersPage": {
    "title": "My Service Packages",
    "subtitle": "Create professional service packages that attract the best merchants and reflect your unique talent",
    "loading": "Loading packages...",
    "stats": {
      "count": "{{count}} service package(s)"
    },
    "actions": {
      "create": "Create New Package",
      "activate": "Activate Package",
      "deactivate": "Deactivate Package"
    },
    "empty": {
      "title": "You don't have any packages yet",
      "description": "Start your journey with merchants by creating your first service package that reflects your talent",
      "cta": "Start My Journey"
    },
    "status": {
      "active": "Active",
      "paused": "Paused",
      "activeBadge": "🟢 Active",
      "pausedBadge": "🟡 Paused"
    },
    "tier": {
      "delivery": "Delivery in {{days}} days",
      "unlimitedRevisions": "Unlimited revisions",
      "revisions": "{{count}} revisions"
    },
    "dialog": {
      "create": {
        "title": "Create New Service Package"
      },
      "edit": {
        "title": "Edit Service Package"
      },
      "delete": {
        "title": "Are you sure?",
        "description": "The package \"{{title}}\" will be permanently deleted.",
        "confirm": "Yes, Delete Package"
      }
    },
    "toast": {
      "fetchError": "❌ Failed to load service packages.",
      "saveSuccess": "✨ Package saved successfully!",
      "deleting": "🔄 Deleting package...",
      "deleteSuccess": "🗑️ Package deleted successfully!",
      "deleteError": "❌ Failed to delete package.",
      "updatingStatus": "🔄 Updating status...",
      "updateStatusSuccess": "✨ Package {{action}} successfully!",
      "updateStatusError": "❌ Failed to update status."
    }
  },
  "modelwallet": {
    "pageTitle": "My Wallet",
    "pageSubtitle": "Manage your earnings, track transactions, and withdraw funds securely and easily",

    "overview": {
      "availableBalance": "Available Balance",
      "pendingEarnings": "Pending Earnings",
      "totalEarnings": "Total Earnings",
      "thisMonth": "This Month"
    },

    "payout": {
      "title": "New Withdrawal Request",
      "description": "Withdraw your earnings to your bank account or e-wallet",
      "amountLabel": "Amount (SAR)",
      "amountPlaceholder": "Enter the amount you wish to withdraw",
      "minAmount": "Minimum: {{min}} SAR",
      "available": "Available: {{balance}} SAR",
      "methodLabel": "Payout Method",
      "quickAmounts": "Quick Amounts",
      "securityNotice": {
        "title": "Security Notice",
        "description": "All transactions are secure and encrypted. Withdrawal requests are processed within 1–3 business days."
      },
      "submit": "Confirm Withdrawal Request",
      "submitting": "Sending Request...",
      "confirmDialog": {
        "title": "Confirm Withdrawal",
        "description": "Are you sure you want to withdraw {{amount}} SAR?",
        "amount": "Amount:",
        "method": "Payout Method:",
        "cancel": "Cancel",
        "confirm": "Confirm Withdrawal",
        "processing": "Processing..."
      }
    },

    "transactions": {
      "title": "Recent Transactions",
      "timeRange": {
        "week": "Week",
        "month": "Month",
        "year": "Year"
      },
      "noTransactions": "No transactions",
      "viewAll": "View All",
      "status": {
        "completed": "Completed",
        "pending": "Pending",
        "failed": "Failed"
      },
      "types": {
        "earning": "Earning",
        "payout": "Payout",
        "refund": "Refund"
      }
    },

    "summary": {
      "title": "Earnings Summary",
      "totalRevenue": "Total Revenue",
      "totalPayouts": "Total Withdrawals",
      "netBalance": "Net Balance"
    },

    "errors": {
      "invalidAmount": "❌ Please enter a valid amount.",
      "minAmount": "❌ Minimum withdrawal is {{min}} SAR.",
      "insufficientBalance": "❌ Requested amount exceeds your available balance.",
      "noMethod": "❌ Please select a payout method.",
      "fetchFailed": "❌ Failed to load wallet data.",
      "payoutFailed": "❌ An error occurred while submitting the request."
    },

    "success": {
      "payoutRequested": "✨ Withdrawal request sent successfully!"
    },

    "loading": "Loading wallet data...",
    "availableNow": "Available for immediate withdrawal",
    "underReview": "Under review and transfer",
    "allTimeEarnings": "All your earnings to date",
    "currentMonthEarnings": "Current month earnings",
    "default": "Default"
  },
  "supplierdashboard": {
    "loading": "Loading data...",
    "verification": {
      "title": "Account Verification",
      "pending": {
        "title": "Your request is under review",
        "description": "Your verification documents have been submitted and are currently being reviewed. We’ll notify you by email once the process is complete."
      },
      "required": {
        "title": "Verification Required",
        "description": "Your account is not yet verified. Please complete the verification process to access your dashboard and start selling products.",
        "button": "Go to Verification"
      }
    },

    "welcome": "Welcome back, {{name}}!",
    "subtitle": "Overview of your dropshipping business",

    "stats": {
      "availableBalance": "Available Balance",
      "totalProducts": "Total Products",
      "totalOrders": "Total Orders",
      "totalStock": "Total Stock"
    },

    "quickActions": {
      "title": "Quick Actions",
      "addProduct": "Add New Product",
      "viewOrders": "View Orders",
      "manageInventory": "Manage Inventory",
      "reports": "Reports"
    },

    "currency": "SAR"
  },
  "suppliernav": {
    "nav": {
      "Overview": "Overview",
      "Products": "Products",
      "Orders": "Orders",
      "Shipping": "Shipping",
      "Wallet": "Wallet",
      "Settings": "Settings"
    }
  },
  "footer": {
    "company": {
      "name": "LINYORA",
      "description": "An integrated women's platform that brings together commerce, fashion, and creativity in one safe and trusted place."
    },
    "features": {
      "exclusiveFashion": {
        "title": "Exclusive Fashion",
        "description": "Latest designs and products that reflect your taste."
      },
      "safeEnvironment": {
        "title": "Safe Environment",
        "description": "We guarantee you a reliable and secure shopping and collaboration experience."
      },
      "fastDelivery": {
        "title": "Fast Delivery",
        "description": "Fast and reliable delivery for all your orders."
      },
      "womenSupport": {
        "title": "Comprehensive Women Support",
        "description": "A specialized support team to assist you at every step."
      }
    },
    "quickLinks": {
      "title": "Quick Links",
      "home": "Home",
      "shop": "Shop",
      "about": "About Us",
      "returnPolicy": "Return Policy",
      "contact": "Contact Us"
    },
    // In en -> translation -> footer
    "discoverLinyora": {
      "title": "Discover Linyora",
      "newArrivals": "New Arrivals",
      "bestSellers": "Best Sellers",
      "specialOffers": "Special Offers",
      "browseDesigners": "Browse Designers"
    },
    "platformSections": {
      "title": "Platform Sections",
      "becomeMerchant": "Become a Merchant",
      "becomeModel": "Become a Model",
      "becomeInfluencer": "Become an Influencer",
      "dropshipping": "Dropshipping"
    },
    "contact": {
      "title": "Contact Us",
      "address": "Riyadh, Saudi Arabia"
    },
    "legal": {
      "privacyPolicy": "Privacy Policy",
      "terms": "Terms & Conditions"
    },
    "copyright": "Linora Platform. All rights reserved."
  },
  "select": "Choose rejection reason",
  "ModelAnalytics": {
    "loading": "Loading analytics...",
    "error": {
      "title": "Failed to Load Data",
      "description": "Sorry, analytics data cannot be loaded at this time."
    },
    "title": "Performance Analytics",
    "subtitle": "Deep insights into your performance and earnings on the platform to achieve the best results",
    "timeRange": {
      "month": "Monthly",
      "quarter": "Quarterly",
      "year": "Yearly"
    },
    "stats": {
      "totalEarnings": "Total Earnings",
      "totalEarningsGrowth": "+12% increase from last month",
      "completedAgreements": "Completed Collaborations",
      "completedAgreementsGrowth": "+8% increase from last month",
      "averageDealPrice": "Average Deal Price",
      "averageDealPriceGrowth": "+5% increase from last month",
      "engagementRate": "Engagement Rate",
      "engagementRateGrowth": "+15% increase from last month"
    },
    "chart": {
      "title": "Collaboration Requests (Last 6 Months)"
    },
    "performance": {
      "title": "Performance Metrics",
      "engagement": "Engagement Rate",
      "profileViews": "Profile Views",
      "satisfaction": "Customer Satisfaction",
      "growth": "+{{percent}}% from last month"
    },
    "topOffers": {
      "title": "Top 5 Performing Offers",
      "headers": {
        "offer": "Offer",
        "price": "Price",
        "requests": "Requests"
      }
    },
    "insights": {
      "title": "Additional Insights",
      "profileViews": "Profile Views",
      "rating": "Customer Rating",
      "completionRate": "Completion Rate"
    }
  },
  "modelprofile": {
    "pageTitle": "Edit Profile",
    "pageSubtitle": "Make your profile attractive to merchants by filling in all information and showcasing your talent",

    "basicInfo": {
      "title": "Basic Information",
      "fullName": "Full Name",
      "fullNamePlaceholder": "Enter your full name",
      "bio": "Bio",
      "bioPlaceholder": "Write a bio about yourself, your experience, and the types of products you prefer...",
      "profilePicture": "Profile Picture",
      "profilePictureTip": "A clear profile picture increases your chances"
    },

    "portfolio": {
      "title": "Portfolio",
      "description": "Add your best photos to attract merchants. (Max 10 photos)",
      "addImage": "Add Photo",
      "uploadPrompt": "Click to upload",
      "uploading": "Uploading...",
      "removeImage": "Remove image"
    },

    "stats": {
      "title": "Statistics",
      "followers": "Followers",
      "followersPlaceholder": "e.g., 150K",
      "engagement": "Engagement Rate",
      "engagementPlaceholder": "e.g., 2.5%"
    },

    "social": {
      "title": "Social Links",
      "instagram": "Instagram",
      "tiktok": "TikTok",
      "twitter": "Twitter (X)",
      "snapchat": "Snapchat",
      "facebook": "Facebook",
      "whatsapp": "WhatsApp",
      "whatsappPlaceholder": "Phone number with country code, e.g., +9665...",
      "instagramPlaceholder": "https://instagram.com/username",
      "tiktokPlaceholder": "https://tiktok.com/@username",
      "twitterPlaceholder": "https://x.com/username",
      "snapchatPlaceholder": "https://snapchat.com/add/username",
      "facebookPlaceholder": "https://facebook.com/username"
    },

    "actions": {
      "saveChanges": "Save Changes",
      "saving": "Saving..."
    },

    "toasts": {
      "loading": "Loading profile...",
      "saveSuccess": "✨ Changes saved successfully!",
      "saveError": "❌ Failed to save changes. Please try again.",
      "profilePicSuccess": "✨ Profile picture updated successfully.",
      "portfolioAddSuccess": "🎨 Photo added to portfolio.",
      "portfolioRemove": "🗑️ Photo removed from portfolio.",
      "uploadError": "❌ Failed to upload image. Please try again."
    }
  },
  "supplierorders": {
  "pageTitle": "Supplier Orders",
  "pageSubtitle": "Manage and track all your orders from merchants and customers.",
  "toasts": {
    "fetchError": "Failed to load orders. Please try again.",
    "detailsError": "Failed to load order details.",
    "updateSuccess": "Order status updated successfully!",
    "updateError": "Failed to update order status. Please try again."
  },
  "status": {
    "pending": "Pending",
    "processing": "Processing",
    "shipped": "Shipped",
    "completed": "Completed",
    "cancelled": "Cancelled"
  },
  "table": {
    "headers": {
      "orderId": "Order ID",
      "customer": "Customer",
      "store": "Store",
      "product": "Product",
      "earnings": "Earnings",
      "date": "Date",
      "status": "Status"
    },
    "loading": "Loading orders...",
    "quantity": "{{quantity}} units",
    "totalEarnings": "Total: {{total}}",
    "empty": {
      "title": "No Orders Yet",
      "description": "You don’t have any orders at the moment."
    }
  },
  "modal": {
    "title": "Order #{{orderId}}",
    "date": "Placed on: {{date}}",
    "customerInfo": "Customer Info",
    "shippingAddress": "Shipping Address",
    "itemsInOrder": "Items in Order",
    "quantity": "Quantity",
    "totalCost": "Total Cost",
    "productDetails": "Product",
    "salePrice": "Sale Price",
    "productEarnings": "Product Earnings",
    "shippingEarnings": "Shipping Earnings",
    "total": "Total Earnings",
    "paymentDetails": "Payment Details",
    "paymentMethod": "Payment Method",
    "shippingCost": "Shipping Cost",
    "orderTotal": "Order Total",
    "updateStatus": "Update Order Status",
    "statusPlaceholder": "Select new status",
    "updating": "Updating...",
    "saveChanges": "Save Changes"
  }
  },
  "suppliershipping": {
    "pageTitle": "Shipping Management",
    "pageSubtitle": "Add and edit shipping companies you work with",

    "actions": {
      "addCompany": "Add New Company",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel",
      "saveChanges": "Save Changes",
      "addCompanyButton": "Add Company"
    },

    "table": {
      "headers": {
        "name": "Company Name",
        "cost": "Shipping Cost",
        "actions": "Actions"
      },
      "loading": "Loading shipping companies...",
      "empty": {
        "title": "No shipping companies",
        "description": "Start by adding your first shipping company"
      }
    },

    "form": {
      "title": {
        "add": "Add New Shipping Company",
        "edit": "Edit Shipping Company"
      },
      "labels": {
        "name": "Company Name",
        "cost": "Shipping Cost (SAR)"
      },
      "placeholders": {
        "name": "e.g., Aramex",
        "cost": "e.g., 35.50"
      },
      "errors": {
        "nameRequired": "❌ Company name is required.",
        "invalidCost": "❌ Shipping cost must be a non-negative number."
      }
    },

    "toasts": {
      "fetchError": "❌ Failed to load shipping companies.",
      "saveSuccess": {
        "add": "✨ Shipping company added successfully.",
        "update": "✨ Shipping company updated successfully."
      },
      "deleteSuccess": "🗑️ Shipping company deleted successfully.",
      "deleteError": "❌ Failed to delete shipping company.",
      "genericError": "❌ An error occurred."
    },

    "dialogs": {
      "delete": {
        "title": "Are you sure?",
        "description": "The shipping company '{{name}}' will be permanently deleted.",
        "warning": "This action cannot be undone.",
        "confirm": "Yes, delete company"
      }
    },

    "badges": {
      "companyCount": "{{count}} shipping company(s)"
    }
  },
  "supplierwallet": {
    "pageTitle": "Financial Wallet",
    "pageSubtitle": "Manage your earnings and withdrawal requests",

    "stats": {
      "availableBalance": "Available Balance for Withdrawal",
      "pendingEarnings": "Pending Earnings"
    },

    "payoutHistory": {
      "title": "Withdrawal History",
      "headers": {
        "amount": "Amount",
        "date": "Date",
        "status": "Status",
        "notes": "Admin Notes"
      },
      "empty": {
        "title": "No previous withdrawal requests",
        "description": "You can submit your first withdrawal request"
      }
    },

    "payoutForm": {
      "title": "New Withdrawal Request",
      "label": "Amount to Withdraw",
      "placeholder": "0.00",
      "submit": "Submit Request",
      "submitting": "Sending...",
      "infoTitle": "Important Note",
      "infoDescription": "Your request will be reviewed and the amount transferred to your registered bank account within 3–5 business days."
    },

    "status": {
      "pending": "Under Review",
      "approved": "Approved",
      "rejected": "Rejected"
    },

    "toasts": {
      "fetchError": "❌ Failed to load wallet data.",
      "invalidAmount": "❌ Amount must be greater than zero.",
      "insufficientBalance": "❌ Requested amount exceeds your available balance.",
      "submitSuccess": "✨ Withdrawal request sent successfully!",
      "submitError": "❌ Failed to submit the request."
    },

    "currency": "SAR"
  },
  "CategoriesPage": {
    "search": {
      "placeholder": "Search categories...",
      "clear": "Clear search"
    },
    "filters": {
      "all": "All",
      "featured": "Featured",
      "trending": "Trending"
    },
    "badges": {
      "featured": "Featured",
      "trending": "Trending"
    },
    "category": {
      "products_one": "{{count}} product",
      "products_other": "{{count}} products",
      "subcategories_one": "{{count}} subcategory",
      "subcategories_other": "{{count}} subcategories"
    },
    "results": {
      "count": "Showing {{current}} of {{total}} categories"
    },
    "empty": {
      "title": "No categories found",
      "noResults": "No results for \"{{query}}\". Try different search terms.",
      "noCategories": "No categories available at the moment.",
      "viewAll": "View all categories"
    }
  },
  "supplierproducts": {
    "pageTitle": "Manage Products",
    "pageSubtitle": "Add and edit your dropshipping products",

    "stats": {
      "totalProducts": "Total Products",
      "totalVariants": "Total Variants",
      "lowStock": "Low Stock Variants"
    },

    "actions": {
      "searchPlaceholder": "Search for a product...",
      "filter": "Filter",
      "addProduct": "Add New Product",
      "addFirstProduct": "Add First Product"
    },

    "table": {
      "headers": {
        "color": "Color",
        "costPrice": "Cost Price",
        "quantity": "Quantity",
        "images": "Images"
      },
      "loading": "Loading products...",
      "empty": {
        "title": "You haven’t added any products yet",
        "description": "Start by adding your first product to show to merchants"
      },
      "found": "{{count}} product(s) found"
    },

    "stock": {
      "outOfStock": "Out of Stock",
      "lowStock": "Low Stock",
      "available": "Available"
    },

    "dialogs": {
      "addTitle": "Add New Product",
      "editTitle": "Edit Product",
      "delete": {
        "title": "Are you sure?",
        "description": "The product '{{name}}' will be permanently deleted.",
        "warning": "This action cannot be undone.",
        "cancel": "Cancel",
        "confirm": "Yes, delete product"
      }
    },

    "toasts": {
      "saveSuccess": "✨ Product saved successfully!",
      "deleteSuccess": "🗑️ Product deleted successfully.",
      "fetchError": "❌ Failed to load products.",
      "deleteError": "❌ Failed to delete product."
    },

    "badges": {
      "productCount": "{{count}} product(s)"
    }
  },
  "supplierproductform": {
    "title": {
      "add": "Add New Product",
      "edit": "Edit Product"
    },
    "subtitle": {
      "add": "Fill in the information to create a new product",
      "edit": "Update the product information"
    },
    "labels": {
      "name": "Product Name",
      "brand": "Brand",
      "description": "Product Description",
      "categories": "Categories",
      "variants": "Product Options (Variants)",
      "color": "Color",
      "costPrice": "Cost Price (SAR)",
      "quantity": "Quantity",
      "images": "Option Images"
    },
    "placeholders": {
      "name": "e.g., Elegant Evening Dress",
      "brand": "e.g., Linora Style",
      "description": "Enter a detailed product description...",
      "categorySearch": "Search for a category...",
      "color": "Red",
      "costPrice": "150.00",
      "quantity": "100"
    },
    "buttons": {
      "addVariant": "Add New Option",
      "uploadImage": "Upload Image",
      "submitAdd": "Create Product",
      "submitEdit": "Save Changes",
      "saving": "Saving...",
      "loadingCategories": "Loading categories..."
    },
    "category": {
      "noResults": "No results.",
      "placeholder": "Select the categories this product belongs to..."
    },
    "variants": {
      "minOne": "ℹ️ The product must have at least one option."
    },
    "toasts": {
      "imageUploadSuccess": "✨ Image uploaded successfully.",
      "imageUploadError": "❌ Failed to upload image.",
      "saveSuccess": {
        "add": "✨ Product created successfully!",
        "edit": "✨ Product updated successfully!"
      },
      "saveError": "❌ Save failed: {{message}}",
      "categoriesError": "❌ Failed to load category list."
    }
  },
    }
  },
  ar: {
    translation: {
      "Header": {
        "home": "الرئيسية",
        "categories": "التصنيفات",
        "trends": "الترندات",
        "cart": "السلة",
        "profile": "حسابي",
        "dashboard": "لوحة التحكم",
        "logout": "تسجيل الخروج",
        "login": "الدخول",
        "register": "إنشاء حساب",
        "search": "بحث",
        "searchPlaceholder": "ابحث عن منتجات...",
        "noSearchResults": "لا توجد نتائج بحث",
        "notifications": "الإشعارات",
        "noNewNotifications": "لا توجد إشعارات جديدة",
        "markAllAsRead": "تحديد الكل كمقروء",
        "newNotifications": "{{count}} جديدة",
        "myOrders": "طلباتي",
        "wishlist": "قائمة الأمنيات",
        "luxuryMarketplace": "سوق فاخر"
      },
      "HomePage": {
        "title": "اكتشف منتجاتنا",
        "loading": "جاري تحميل المنتجات...",
        "noProducts": "لا توجد منتجات متاحة حاليًا."
      },
      "Sidebar": {
        "storeName": "متجري",
        "nav": {
          "overview": "نظرة عامة",
          "verification":"التحقق",
          "products": "المنتجات",
          "wallet":"المحفظه",
          "agreements":"الإتفاقيات",
          "mySubscription":"إشتراكاتي",
          "subscribe":"إشترك",
          "shipping":"شركات الشحن",
          "orders": "الطلبات",
          "models": "العارضات والمؤثرات",
          "influencers": "المؤثرات",
          "dropshipping": "الدروب شوبينج",
          "messages": "الرسائل",
          "analytics": "التحليلات",
          "settings": "إعدادات المتجر"
        },
        "logout": "تسجيل الخروج"
      },
      "Login": {
        "title": "تسجيل الدخول",
        "subtitle": "مرحباً بعودتك إلى عالم الرفاهية",
        "emailLabel": "البريد الإلكتروني",
        "emailPlaceholder": "example@email.com",
        "passwordLabel": "كلمة المرور",
        "passwordPlaceholder": "أدخل كلمة المرور",
        "forgotPassword": "هل نسيت كلمة المرور؟",
        "loginButton": "دخول",
        "noAccount": "ليس لديك حساب؟",
        "createAccount": "إنشاء حساب جديد",
        "or": "أو",
        "google": "Google",
        "facebook": "Facebook",
        "loading": "جاري تسجيل الدخول...",
        "error": "فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى."
      },
      "joinUs":{
        "title": "انضم إلينا كشريك",
        "subtitle": "أنشئ حسابك المهني ونمّي عملك معنا.",
        "areYouACustomer": "هل أنت عميل؟",
        "registerHere": "سجّل من هنا"
      },
      "register": {
        "customerTitle": "أنشئ حسابك",
        "customerSubtitle": "انضم كعميل وابدأ التسوق معنا اليوم!",
        "fullNamePlaceholder": "الاسم الكامل",
        "emailPlaceholder": "عنوان البريد الإلكتروني",
        "phonePlaceholder": "رقم الهاتف (اختياري)",
        "accountTypeLabel": "نوع الحساب",
        "accountTypePlaceholder": "اختر دورك",
        "merchant": "تاجر / صاحب متجر",
        "model": "موديل",
        "influencer": "مؤثر / منشئ محتوى",
        "dropshipper": "مورّد (دروبشيبينغ)",
        "errorNoRole": "يرجى اختيار نوع الحساب.",
        "passwordPlaceholder": "كلمة المرور",
        "areYouACustomer":"هل أنت عميل؟",
        "registerHere":"سجل هنا",
        "loading": "جارٍ إنشاء الحساب...",
        "registerButton": "تسجيل",
        "errorDefault": "حدث خطأ. يرجى المحاولة مرة أخرى.",
        "alreadyHaveAccount": "هل لديك حساب بالفعل؟",
        "login": "تسجيل الدخول",
        "areYouAPartner": "هل أنت شركة أو مورّد؟",
        "joinHere": "انضم إلينا من هنا"
      },
      "MarqueeBarPage": {
    "title": "إدارة شريط الرسائل المتحركة",
    "subtitle": "أنشئ وأدر الإعلانات المتحركة على منصتك",
    "toast": {
      "fetchError": "فشل تحميل الرسائل",
      "emptyMessage": "يرجى إدخال رسالة",
      "tooLong": "يجب أن تكون الرسالة أقل من 200 حرف",
      "addSuccess": "تمت إضافة الرسالة بنجاح",
      "addError": "فشل في إضافة الرسالة",
      "statusUpdated": "الرسالة {{status}}",
      "updateError": "فشل في تحديث الحالة",
      "deleteSuccess": "تم حذف الرسالة بنجاح",
      "deleteError": "فشل في حذف الرسالة"
    },
    "confirm": {
      "delete": "هل أنت متأكد أنك تريد حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء."
    },
    "stats": {
      "total": "إجمالي الرسائل",
      "active": "الرسائل النشطة",
      "inactive": "الرسائل غير النشطة"
    },
    "speedCard": {
      "title": "سرعة التحريك",
      "subtitle": "تحكم في مدة التمرير (بالثواني). القيمة الأقل تعني سرعة أكبر.",
      "hint": "القيمة الموصى بها: من 15 إلى 30 ثانية. الحد الأدنى: 5 ثوانٍ."
    },
    "addCard": {
      "title": "إضافة رسالة جديدة",
      "subtitle": "أنشئ إعلانات جذابة ستتحرك عبر المنصة",
      "placeholder": "✨ مجموعة الصيف الجديدة! تسوق الآن واحصل على خصم 20%...",
      "hint": "استخدم الرموز التعبيرية لجذب الانتباه",
      "adding": "جاري الإضافة...",
      "add": "إضافة رسالة"
    },
    "listCard": {
      "title": "الرسائل الحالية",
      "subtitle": "{{count}} رسالة{{count, plural, zero {} one {} two {} few {} many {} other {ات}}}",
      "activeBadge": "{{count}} نشطة",
      "empty": {
        "title": "لا توجد رسائل بعد",
        "subtitle": "ابدأ بإنشاء أول رسالة متحركة لجذب جمهورك."
      },
      "chars": "{{count}} حرف"
    },
    "bestPractices": {
      "title": "أفضل الممارسات",
      "bullet1": "اجعل الرسائل قصيرة وجذابة (أقل من 100 حرف)",
      "bullet2": "استخدم الرموز التعبيرية لجذب الانتباه",
      "bullet3": "فعّل 2-3 رسائل فقط في نفس الوقت لتحسين القراءة",
      "bullet4": "حدّث الرسائل بانتظام للحفاظ على محتوى جديد"
    }
  },
  "CategoriesPage": {
    "search": {
      "placeholder": "ابحث في الفئات...",
      "clear": "مسح البحث"
    },
    "filters": {
      "all": "الكل",
      "featured": "مميزة",
      "trending": "رائجة"
    },
    "badges": {
      "featured": "مميزة",
      "trending": "رائجة"
    },
    "category": {
      "products_zero": "{{count}} منتج",
      "products_one": "{{count}} منتج",
      "products_two": "{{count}} منتجين",
      "products_few": "{{count}} منتجات",
      "products_many": "{{count}} منتجًا",
      "products_other": "{{count}} منتج",
      "subcategories_zero": "{{count}} فئة فرعية",
      "subcategories_one": "{{count}} فئة فرعية",
      "subcategories_two": "{{count}} فئتين فرعيتين",
      "subcategories_few": "{{count}} فئات فرعية",
      "subcategories_many": "{{count}} فئة فرعية",
      "subcategories_other": "{{count}} فئة فرعية"
    },
    "results": {
      "count": "عرض {{current}} من {{total}} فئة"
    },
    "empty": {
      "title": "لم يتم العثور على فئات",
      "noResults": "لا توجد نتائج لـ \"{{query}}\". جرّب مصطلحات بحث أخرى.",
      "noCategories": "لا توجد فئات متاحة حاليًا.",
      "viewAll": "عرض كل الفئات"
    }
  },
  "TrendsPage": {
    "search": {
      "placeholder": "البحث في الصيحات...",
      "clear": "مسح البحث"
    },
    "filters": {
      "title": "التصفية والفرز",
      "quick": "تصفية سريعة"
    },
    "sort": {
      "title": "الفرز حسب",
      "placeholder": "الفرز حسب",
      "popular": "الأكثر رواجًا",
      "newest": "الوصول حديثًا",
      "priceLow": "السعر: من الأقل إلى الأعلى",
      "priceHigh": "السعر: من الأعلى إلى الأقل"
    },
    "view": {
      "title": "وضع العرض"
    },
    "badges": {
      "newArrivals": "الوصول حديثًا",
      "under50": "أقل من 50 ر.س"
    },
    "results": {
      "showing": "عرض {{current}} من أصل {{total}} منتج",
      "footer": "عرض {{current}} من أصل {{total}} منتج رائج"
    },
    "empty": {
      "title": "لم يتم العثور على منتجات",
      "noResults": "لا توجد نتائج لـ \"{{query}}\". جرّب تعديل بحثك.",
      "noTrends": "لا توجد منتجات رائجة حاليًا."
    },
    "loadMore": "عرض مزيد من الصيحات"
  },
      "AdminDashboard": {
        "header": {
          "title": "لوحة التحكم الإدارية",
          "subtitle": "نظرة شاملة على أداء المنصة وإحصائيات المستخدمين"
        },
        "actions": {
          "liveView": "نظرة حية على المنصة",
          "lastUpdate": "آخر تحديث: الآن",
          "exportReport": "تصدير التقرير",
          "refreshData": "تحديث البيانات",
          "viewDetails": "عرض التفاصيل"
        },
        "stats": {
          "platformRevenue": "إيرادات المنصة",
          "totalRevenue": "إجمالي الإيرادات",
          "platformEarnings": "أرباح المنصة",
          "netProfit": "صافي الأرباح",
          "totalUsers": "إجمالي المستخدمين",
          "activeUsers": "{{count}} مستخدم نشط",
          "products": "المنتجات",
          "activeProducts": "منتج نشط",
          "orders": "الطلبات",
          "pendingOrders": "{{count}} طلب معلق",
          "agreements": "الاتفاقيات",
          "successfulCollabs": "تعاونات ناجحة",
          "merchants": "التجار",
          "registeredMerchants": "تاجر مسجل",
          "customers": "العملاء",
          "activeCustomers": "عميل نشط"
        },
        "charts": {
          "sales": "المبيعات",
          "users": "المستخدمون",
          "salesTitle": "تحليل المبيعات",
          "salesSubtitle": "أداء المبيعات خلال الفترة المحددة",
          "userDistribution": "توزيع المستخدمين",
          "userDistributionSubtitle": "توزيع المستخدمين حسب الأدوار على المنصة",
          "bar": "أعمدة",
          "area": "منطقة",
          "last7Days": "7 أيام",
          "last30Days": "30 يوم"
        },
        "activity": {
          "title": "النشاط الأخير",
          "subtitle": "آخر الأحداث والأنشطة على المنصة"
        },
        "goals": {
          "title": "أهداف المنصة",
          "subtitle": "مؤشرات الأداء الرئيسية والتقدم",
          "userGrowth": "معدل نمو المستخدمين",
          "orderCompletion": "معدل إكمال الطلبات",
          "merchantSatisfaction": "رضا التجار",
          "revenueGrowth": "نمو الإيرادات",
          "progress": "التقدم"
        },
        "roles": {
          "merchants": "التجار",
          "models": "النماذج",
          "influencers": "المؤثرون",
          "customers": "العملاء"
        },
        "toast": {
          "refreshSuccess": "✨ تم تحديث البيانات بنجاح",
          "refreshError": "❌ فشل في جلب البيانات",
          "preparingReport": "📊 جاري تحضير التقرير..."
        },
        "error": {
          "title": "فشل في تحميل البيانات",
          "message": "حدث خطأ أثناء جلب بيانات لوحة التحكم",
          "retry": "إعادة المحاولة"
        }
      },
      "roles": {
        "merchants": "التجار",
        "models": "العارضون",
        "influencers": "المؤثرون",
        "customers": "العملاء"
      },
      "AdminUsers": {
        "title": "إدارة المستخدمين",
        "subtitle": "عرض وإدارة جميع مستخدمي المنصة.",
        "userList": "قائمة المستخدمين",
        "totalUsers": "إجمالي المستخدمين: {{count}}",
        "name": "الاسم",
        "email": "البريد الإلكتروني",
        "role": "الدور",
        "registrationDate": "تاريخ التسجيل",
        "lastLogin": "آخر دخول",
        "actionss": "الإجراءات",
        "statuss": "الحالة",
        "neverLoggedIn":"لم يسجل مطلقا",
        "loading": "جاري تحميل المستخدمين...",
        "noUsers": "لم يتم العثور على مستخدمين.",
        "searchPlaceholder": "ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف...",
        "allRoles": "جميع الأدوار",
        "allStatuses": "جميع الحالات",
        "activeOnly": "نشط فقط",
        "bannedOnly": "محظور فقط",
        "exportData": "تصدير البيانات",
        "refresh": "تحديث",
        "stats": {
          "total": "إجمالي المستخدمين",
          "active": "نشطين",
          "banned": "محظورين",
          "models": "عارضات",
          "merchants": "تجار",
          "admins": "مشرفين"
        },
        "status": {
          "active": "نشط",
          "banned": "محظور",
          "verified": "موثق"
        },
        "roles": {
          "Admin": "مشرف",
          "Merchant": "تاجر",
          "Model": "عارضة"
        },
        "actions": {
          "editRole": "تعديل الدور",
          "banUser": "حظر المستخدم",
          "unbanUser": "فك الحظر",
          "deleteUser": "حذف المستخدم"
        },
        "dialogs": {
          "editRole": {
            "title": "تعديل دور المستخدم",
            "description": "تغيير دور المستخدم {{name}}",
            "currentRole": "الدور الحالي",
            "newRole": "الدور الجديد",
            "roleOptions": {
              "admin": "مشرف",
              "merchant": "تاجر",
              "model": "عارضة"
            }
          },
          "deleteUser": {
            "title": "هل أنت متأكد؟",
            "description": "سيتم حذف المستخدم \"{{name}}\" بشكل دائم من النظام. لا يمكن التراجع عن هذا الإجراء.",
            "confirm": "نعم، احذف المستخدم",
            "cancel": "إلغاء"
          }
        },
        "toasts": {
          "loadError": "فشل في تحميل بيانات المستخدمين",
          "banSuccess": "تم حظر المستخدم بنجاح!",
          "unbanSuccess": "تم فك حظر المستخدم بنجاح!",
          "roleUpdateSuccess": "تم تحديث دور المستخدم بنجاح!",
          "deleteSuccess": "تم حذف المستخدم بنجاح!",
          "exportPreparing": "جارٍ تحضير بيانات التصدير..."
        },
        "filters": {
          "noResults": "لم نعثر على مستخدمين يطابقون معايير البحث. حاول تعديل الفلاتر.",
          "empty": "لا توجد حسابات مستخدمين في النظام حالياً."
        }
      },
      "Verifications": {
        "title": "إدارة طلبات التحقق",
        "subtitle": "مراجعة والتحقق من هوية المستخدمين والتجار لضمان أمان المنصة",
        "stats": {
          "total": "إجمالي الطلبات",
          "pending": "بانتظار المراجعة",
          "approved": "تم الموافقة",
          "rejected": "مرفوضة",
          "business": "شركات",
          "individual": "أفراد"
        },
        "priorityOverview": {
          "title": "أولويات المراجعة",
          "count": "{{count}} طلب"
        },
        "priority": {
          "low": "منخفض",
          "medium": "متوسط",
          "high": "عالي"
        },
        "status": {
          "pending": "بانتظار المراجعة",
          "approved": "تم الموافقة",
          "rejected": "مرفوض"
        },
        "type": {
          "individual": "فرد",
          "business": "شركة"
        },
        "search": {
          "placeholder": "ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
        },
        "filters": {
          "status": {
            "all": "جميع الحالات"
          },
          "type": {
            "all": "جميع الأنواع"
          },
          "priority": {
            "all": "جميع الأولويات"
          },
          "reset": "إعادة تعيين الفلاتر"
        },
        "export": {
          "title": "تصدير البيانات"
        },
        "table": {
          "title": "طلبات التحقق",
          "subtitle": "عرض وإدارة جميع طلبات التحقق من الهوية ({{count}} طلب)",
          "count": "{{count}} طلب",
          "headers": {
            "user": "المستخدم",
            "business": "الشركة",
            "type": "النوع",
            "status": "الحالة",
            "priority": "الأولوية",
            "date": "التاريخ",
            "documents": "المستندات",
            "actions": "الإجراءات"
          },
          "noResults": "لا توجد طلبات تحقق في الوقت الحالي",
          "noResultsFiltered": "لم نعثر على طلبات تطابق معايير البحث"
        },
        "documents": {
          "count": "{{count}} مستند"
        },
        "actions": {
          "review": "مراجعة",
          "quickApprove": "الموافقة السريعة",
          "quickReject": "الرفض السريع",
          "downloadDocs": "تحميل المستندات",
          "sendEmail": "إرسال بريد إلكتروني"
        },
        "dialog": {
          "approve": {
            "title": "تأكيد الموافقة",
            "description": "هل أنت متأكد من الموافقة على طلب التحقق لـ {{name}}؟",
            "confirm": "تأكيد الموافقة"
          },
          "reject": {
            "title": "تأكيد الرفض",
            "description": "يرجى تحديد سبب رفض طلب التحقق لـ {{name}}",
            "reasonLabel": "سبب الرفض",
            "reasonPlaceholder": "أدخل سبب الرفض...",
            "confirm": "تأكيد الرفض"
          }
        },
        "toast": {
          "fetchSuccess": "✨ تم تحديث قائمة طلبات التحقق",
          "fetchError": "❌ فشل في تحميل طلبات التحقق",
          "updating": "🔄 جاري {{action}}...",
          "updateSuccess": "✨ تم {{action}} الطلب بنجاح!",
          "updateError": "❌ فشل في {{action}}",
          "exportPreparing": "📥 جاري تحضير بيانات التصدير بصيغة {{format}}..."
        }
      },
      "AdminBanners": {
        "title": "إدارة البانرات الرئيسية",
        "subtitle": "قم بإدارة البانرات الترويجية في الصفحة الرئيسية",
        "form": {
          "addTitle": "إضافة بانر جديد",
          "editTitle": "تعديل البانر",
          "addDescription": "أضف بانرًا جديدًا للصفحة الرئيسية",
          "editDescription": "قم بتعديل بيانات البانر الحالي",
          "saveButton": "✨ إضافة بانر",
          "updateButton": "💾 حفظ التعديلات",
          "cancelEdit": "إلغاء التعديل"
        },
        "fields": {
          "title": "العنوان الرئيسي",
          "subtitle": "العنوان الفرعي",
          "badgeText": "نص الشارة",
          "buttonText": "نص الزر",
          "linkUrl": "الرابط المستهدف",
          "isActive": "تفعيل البانر",
          "image": "صورة الخلفية"
        },
        "placeholders": {
          "title": "أدخل العنوان الرئيسي الجذاب...",
          "subtitle": "أدخل وصفًا مختصرًا وجذابًا...",
          "badgeText": "عرض مميز، محدود، إلخ...",
          "buttonText": "تسوق الآن، اكتشف المزيد، إلخ...",
          "linkUrl": "/products?category=1"
        },
        "validation": {
          "titleRequired": "العنوان يجب أن يكون 3 أحرف على الأقل",
          "subtitleTooShort": "العنوان الفرعي يجب أن يكون 5 أحرف على الأقل",
          "linkRequired": "الرابط مطلوب",
          "invalidUrl": "يجب أن يكون رابطًا صحيحًا",
          "buttonTextRequired": "نص الزر مطلوب",
          "imageType": "يرجى اختيار ملف صورة فقط",
          "imageSize": "حجم الصورة يجب أن يكون أقل من 5MB"
        },
        "preview": {
          "title": "معاينة البانر",
          "defaultTitle": "العنوان الرئيسي",
          "defaultSubtitle": "العنوان الفرعي"
        },
        "list": {
          "title": "قائمة البانرات",
          "total": "{{count}} بانر",
          "empty": "لا توجد بانرات",
          "emptyDescription": "لم تقم بإضافة أي بانرات ترويجية بعد",
          "loading": "جاري تحميل البانرات...",
          "image": "الصورة",
          "status": "الحالة",
          "dateAdded": "تاريخ الإضافة",
          "actions": "الإجراءات"
        },
        "status": {
          "active": "نشط",
          "inactive": "غير نشط"
        },
        "actions": {
          "edit": "تعديل",
          "delete": "حذف"
        },
        "deleteDialog": {
          "title": "هل أنت متأكد؟",
          "description": "سيتم حذف البانر \"{{title}}\" بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
          "confirm": "نعم، احذف البانر",
          "cancel": "إلغاء"
        },
        "toasts": {
          "saveSuccess": "تم إضافة البانر بنجاح!",
          "updateSuccess": "تم تحديث البانر بنجاح!",
          "deleteSuccess": "تم حذف البانر بنجاح!",
          "saveError": "فشل في حفظ البانر",
          "deleteError": "فشل في حذف البانر",
          "loadError": "فشل في تحميل البانرات"
        }
      },
      "VerificationDetails": {
        "title": "مراجعة طلب التاجر: {{name}}",
        "notFound": "لم يتم العثور على بيانات التوثيق لهذا المستخدم.",
        "sections": {
          "identity": {
            "title": "بيانات الهوية والنشاط التجاري"
          },
          "bank": {
            "title": "البيانات البنكية (لدروب شوبينج)"
          }
        },
        "fields": {
          "identityNumber": "رقم الهوية",
          "businessName": "اسم المؤسسة",
          "identityImage": "صورة الهوية",
          "businessLicense": "السجل التجاري",
          "accountNumber": "رقم الحساب",
          "iban": "رقم الآيبان",
          "ibanCertificate": "شهادة الآيبان"
        },
        "actions": {
          "viewImage": "عرض الصورة",
          "viewDocument": "عرض الملف",
          "viewCertificate": "عرض الشهادة",
          "approve": "موافقة وتفعيل الحساب",
          "reject": "رفض الطلب"
        },
        "dialog": {
          "reject": {
            "title": "سبب رفض طلب التاجر",
            "placeholder": "اكتب سبب واضح للرفض ليتم إرساله للتاجر...",
            "confirm": "تأكيد الرفض"
          }
        },
        "toast": {
          "fetchError": {
            "title": "خطأ",
            "description": "فشل في جلب تفاصيل الطلب."
          },
          "rejectionReasonRequired": {
            "title": "خطأ",
            "description": "سبب الرفض مطلوب."
          },
          "reviewSuccess": {
            "title": "نجاح",
            "description": "تم {{action}} التاجر بنجاح."
          },
          "reviewError": {
            "title": "خطأ",
            "description": "فشلت عملية المراجعة."
          }
        }
      },
      "ModelReelsPage": {
    "title": "رييلاتي",
    "subtitle": "أدر واعرض محتوى الفيديو الخاص بك عبر الرييلات الجميلة",
    "loading": "جارٍ تحميل رييلاتك...",
    "stats": {
      "totalReels": "إجمالي {{count}} ريل{{count, plural, zero {} one {} two {} few {} many {} other {ات}}}",
      "activeReels": "{{count}} نشط{{count, plural, zero {} one {} two {} few {} many {} other {ة}}}"
    },
    "actions": {
      "uploadNew": "رفع ريل جديد"
    },
    "manage": {
      "title": "إدارة مقاطع الفيديو الخاصة بك",
      "subtitle": "عرض وتعديل وإدارة جميع الرييلات التي قمت برفعها في مكان واحد"
    },
    "empty": {
      "title": "لا توجد رييلات بعد",
      "subtitle": "لم تقم برفع أي رييلات بعد. ابدأ بإنشاء محتوى رائع لمشاركته مع جمهورك!",
      "uploadFirst": "ارفع أول ريل لك"
    },
    "table": {
      "preview": "معاينة",
      "details": "الوصف والتفاصيل",
      "performance": "الأداء",
      "status": "الحالة",
      "actions": "الإجراءات"
    },
    "reel": {
      "thumbnailAlt": "صورة مصغرة للريل",
      "noCaption": "(بدون وصف)"
    },
    "performance": {
      "views": "مشاهدات",
      "likes": "إعجابات"
    },
    "confirmDelete": {
      "title": "حذف الريل؟",
      "description": "لا يمكن التراجع عن هذا الإجراء. سيتم حذف الريل وجميع بياناته بشكل دائم من خوادمنا.",
      "confirm": "حذف الريل"
    },
    "editReel": {
      "title": "تعديل الريل"
    },
    "toast": {
      "fetchError": "فشل تحميل رييلاتك.",
      "deleteSuccess": "تم حذف الريل بنجاح",
      "deleteError": "فشل في حذف الريل",
      "updateSuccess": "تم تحديث الريل بنجاح!"
    }
  },
      "ManageProducts": {
        "title": "إدارة المنتجات",
        "subtitle": "إدارة جميع منتجات المنصة، مراجعة حالتها، وتحديث معلوماتها",
        "loading": "جاري تحميل المنتجات...",
        "export": "تصدير البيانات",
        "search": {
          "placeholder": "ابحث باسم المنتج، الماركة، أو التاجر..."
        },
        "filters": {
          "status": {
            "all": "جميع الحالات",
            "active": "نشط فقط",
            "draft": "مسودة فقط",
            "archived": "مؤرشف فقط"
          },
          "category": {
            "all": "جميع الفئات"
          }
        },
        "stats": {
          "total": "إجمالي المنتجات",
          "active": "نشطة",
          "draft": "مسودات",
          "archived": "مؤرشفة",
          "outOfStock": "نفذ المخزون",
          "lowStock": "منخفضة المخزون"
        },
        "status": {
          "active": "نشط",
          "draft": "مسودة",
          "archived": "مؤرشف"
        },
        "statusActions": {
          "active": "التفعيل",
          "draft": "التحويل إلى مسودة",
          "archived": "الأرشفة"
        },
        "inventory": {
          "outOfStock": "نفذ المخزون",
          "low": "منخفض",
          "inStock": "متوفر",
          "units": "{{count}} وحدة"
        },
        "table": {
          "title": "قائمة المنتجات",
          "subtitle": "عرض وإدارة جميع منتجات المنصة ({{count}} منتج)",
          "count": "{{count}} منتج",
          "headers": {
            "product": "المنتج",
            "brand": "الماركة",
            "merchant": "التاجر",
            "price": "السعر",
            "inventory": "المخزون",
            "status": "الحالة",
            "date": "تاريخ الإضافة",
            "actions": "الإجراءات"
          },
          "noResults": {
            "title": "لا توجد نتائج",
            "filtered": "لم نعثر على منتجات تطابق معايير البحث. حاولي تعديل الفلاتر.",
            "empty": "لا توجد منتجات في النظام حالياً."
          }
        },
        "actions": {
          "addProduct": "إضافة منتج",
          "view": "عرض المنتج",
          "edit": "تعديل المنتج",
          "activate": "تفعيل المنتج",
          "toDraft": "تحويل لمسودة",
          "archive": "أرشفة المنتج",
          "delete": "حذف المنتج"
        },
        "fields": {
          "name": "اسم المنتج",
          "brand": "الماركة",
          "status": "الحالة الحالية"
        },
        "dialog": {
          "edit": {
            "title": "تعديل المنتج",
            "description": "تعديل معلومات المنتج {{name}}",
            "save": "حفظ التغييرات"
          },
          "delete": {
            "title": "هل أنت متأكد؟",
            "description": "سيتم حذف المنتج \"{{name}}\" بشكل دائم من النظام.",
            "warning": "لا يمكن التراجع عن هذا الإجراء.",
            "confirm": "نعم، احذف المنتج"
          }
        },
        "toast": {
          "fetchError": "❌ فشل في تحميل بيانات المنتجات",
          "updatingStatus": "🔄 جاري تحديث حالة المنتج...",
          "updateSuccess": "✨ تم {{action}} المنتج بنجاح!",
          "updateError": "❌ فشل في تحديث حالة المنتج",
          "deleting": "🔄 جاري حذف المنتج...",
          "deleteSuccess": "🗑️ تم حذف المنتج بنجاح!",
          "deleteError": "❌ فشل في حذف المنتج",
          "exportPreparing": "📥 جاري تحضير بيانات التصدير..."
        }
      },
      "AdminSubscriptions": {
        "title": "إدارة الاشتراكات",
        "subtitle": "إدارة وتتبع جميع اشتراكات المستخدمين في المنصة",
        "loading": "جاري تحميل الاشتراكات...",
        "export": "تصدير البيانات",
        "search": {
          "placeholder": "ابحث بالاسم أو البريد الإلكتروني..."
        },
        "filters": {
          "status": {
            "all": "جميع الحالات",
            "active": "نشطة فقط",
            "cancelled": "ملغية فقط"
          }
        },
        "stats": {
          "total": "إجمالي الاشتراكات",
          "active": "نشطة",
          "cancelled": "ملغية",
          "mrr": "الإيراد الشهري"
        },
        "status": {
          "active": "نشط",
          "cancelled": "ملغي"
        },
        "table": {
          "title": "سجل الاشتراكات",
          "subtitle": "عرض وإدارة جميع اشتراكات المستخدمين ({{count}} اشتراك)",
          "count": "{{count}} اشتراك",
          "headers": {
            "user": "المستخدم",
            "plan": "نوع الخطة",
            "status": "الحالة",
            "startDate": "تاريخ البدء",
            "endDate": "تاريخ الانتهاء",
            "actions": "الإجراءات"
          },
          "empty": {
            "title": "لا توجد اشتراكات",
            "filtered": "لم نعثر على اشتراكات تطابق معايير البحث",
            "noData": "لا توجد اشتراكات في النظام حالياً"
          }
        },
        "actions": {
          "cancelRenewal": "إلغاء التجديد",
          "deleteRecord": "حذف السجل"
        },
        "dialog": {
          "cancel": {
            "title": "تأكيد إلغاء التجديد",
            "description": "سيتم إلغاء التجديد التلقائي للاشتراك الخاص بـ {{name}}",
            "confirm": "تأكيد الإلغاء"
          },
          "delete": {
            "title": "تأكيد حذف السجل",
            "description": "سيتم حذف سجل الاشتراك الخاص بـ {{name}} بشكل دائم",
            "warning": "لا يمكن التراجع عن هذا الإجراء",
            "confirm": "نعم، احذف السجل"
          }
        },
        "toast": {
          "fetchError": "❌ فشل في تحميل الاشتراكات",
          "cancelling": "🔄 جاري إلغاء التجديد...",
          "cancelSuccess": "✅ تم إلغاء التجديد بنجاح",
          "cancelError": "❌ فشل في إلغاء التجديد",
          "deleting": "🔄 جاري حذف السجل...",
          "deleteSuccess": "🗑️ تم حذف السجل بنجاح",
          "deleteError": "❌ فشل في حذف السجل",
          "exportPreparing": "📥 جاري تحضير بيانات التصدير..."
        }
      },
      "AdminAgreements": {
        "title": "إدارة الاتفاقيات",
        "subtitle": "عرض وتتبع جميع اتفاقيات التعاون التي تتم على المنصة",
        "stats": {
          "total": "إجمالي الاتفاقيات",
          "pending": "قيد الانتظار",
          "accepted": "جاري التنفيذ",
          "completed": "مكتملة",
          "revenue": "إجمالي الإيرادات"
        },
        "status": {
          "pending": "في انتظار الموافقة",
          "accepted": "جاري التنفيذ",
          "rejected": "مرفوض",
          "completed": "مكتمل"
        },
        "card": {
          "package": "باقة الخدمة",
          "product": "المنتج المرتبط",
          "price": "قيمة الباقة"
        },
        "empty": {
          "title": "لا توجد اتفاقيات",
          "description": "لم يتم إنشاء أي اتفاقيات تعاون حتى الآن. ستظهر هنا عند إنشاء أول اتفاقية."
        },
        "toast": {
          "fetchError": "❌ فشل في تحميل الاتفاقيات"
        }
      },
      "ManageCategories": {
        "title": "إدارة الفئات",
        "subtitle": "إنشاء وتعديل هيكل فئات المنتجات في المتجر بطريقة منظمة وسهلة.",
        "loading": "جاري تحميل الفئات...",
        "search": {
          "placeholder": "ابحث في الفئات..."
        },
        "actions": {
          "addCategory": "إنشاء فئة جديدة"
        },
        "tree": {
          "title": "شجرة الفئات",
          "productsCount": "{{count}} منتج"
        },
        "form": {
          "fields": {
            "name": {
              "label": "اسم الفئة",
              "placeholder": "مثال: إلكترونيات"
            },
            "parent": {
              "label": "الفئة الأب (اختياري)",
              "placeholder": "اختر فئة رئيسية...",
              "root": "-- فئة رئيسية --"
            },
            "description": {
              "label": "الوصف"
            },
            "image": {
              "label": "صورة الفئة",
              "uploadPrompt": "انقر لرفع صورة"
            },
            "sortOrder": {
              "label": "ترتيب العرض"
            },
            "status": {
              "label": "الحالة"
            }
          },
          "errors": {
            "nameRequired": "❌ اسم الفئة مطلوب."
          },
          "actions": {
            "create": "🚀 إنشاء الفئة",
            "update": "💾 حفظ التغييرات"
          }
        },
        "dialog": {
          "create": {
            "title": "إنشاء فئة جديدة"
          },
          "edit": {
            "title": "تعديل الفئة"
          },
          "delete": {
            "title": "هل أنت متأكد؟",
            "description": "سيتم حذف الفئة \"{{name}}\" وجميع الفئات الفرعية التابعة لها.",
            "warning": "لا يمكن التراجع عن هذا الإجراء.",
            "confirm": "نعم، احذف الفئة"
          }
        },
        "toast": {
          "fetchError": "❌ فشل في جلب الفئات.",
          "saving": "🔄 جاري حفظ الفئة...",
          "saveSuccess": "✨ تم {{action}} الفئة بنجاح!",
          "saveError": "❌ فشل {{action}} الفئة.",
          "deleting": "🔄 جاري حذف الفئة...",
          "deleteSuccess": "🗑️ تم حذف الفئة بنجاح.",
          "deleteError": "❌ فشل حذف الفئة."
        }
      },

      "Analytics": {
        "title": "تحليلات الأداء",
        "subtitle": "نظرة عميقة على أداء متجرك خلال آخر 30 يومًا.",
        "dailySalesSummary": "ملخص المبيعات اليومية",
        "salesDescription": "عرض المبيعات المكتملة (بالريال السعودي)",
        "sales": "المبيعات",
        "loading": "جاري تحميل بيانات التحليلات..."
      },
      "BrowseModels": {
        "title": "استكشف العارضات",
        "subtitle": "اكتشف المواهب الاستثنائية وابحث عن العارضة المثالية لمشروعك القادم",
        "loading": "جاري تحميل العارضات...",
        "search": {
          "placeholder": "ابحث بالاسم، التخصص، أو الوصف..."
        },
        "filters": {
          "category": {
            "label": "التخصص",
            "all": "الكل"
          },
          "sort": {
            "label": "الترتيب حسب",
            "name": "الاسم",
            "rating": "التقييم",
            "followers": "المتابعين"
          }
        },
        "results": {
          "count": "عرض <span class=\"font-bold text-rose-800\">{{count}}</span> عارضة",
          "updated": "تم تحديث القائمة الآن"
        },
        "empty": {
          "title": "لم نعثر على عارضات",
          "description": "حاولي تعديل كلمات البحث أو الفلاتر للعثور على المزيد من العارضات",
          "reset": "عرض الكل"
        },
        "badges": {
          "featured": "مميزة",
          "verified": "موثقة"
        },
        "role": {
          "model": "عارضة أزياء",
          "influencer": "مؤثرة"
        },
        "defaultBio": "عارضة موهوبة مع خبرة في مجال الأزياء والإعلانات.",
        "stats": {
          "followers": "متابعين",
          "engagement": "تفاعل",
          "rating": "تقييم"
        },
        "actions": {
          "viewProfile": "عرض الملف الشخصي"
        }
      },
      "Products": {
        "title": "إدارة المنتجات",
        "addProduct": "أضف منتج جديد",
        "productName": "اسم المنتج",
        "price": "السعر",
        "stockQuantity": "الكمية المتوفرة",
        "actions": "إجراءات",
        "loading": "جاري تحميل المنتجات...",
        "noProducts": "لم يتم العثور على منتجات.",
        "addNewProduct": "إضافة منتج جديد",
        "editProduct": "تعديل المنتج",
        "deleteConfirm": {
            "title": "هل أنت متأكد تماماً؟",
            "description": "هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المنتج بشكل دائم.",
            "cancel": "إلغاء",
            "confirm": "نعم، قم بالحذف"
        }
      },
      "ProductForm": {
        "basicInfo": {
          "title": "المعلومات الأساسية",
          "subtitle": "أدخل المعلومات الأساسية للمنتج"
        },
        "fields": {
          "productName": "اسم المنتج",
          "brand": "العلامة التجارية",
          "description": "الوصف",
          "status": "حالة المنتج"
        },
        "status": {
          "active": "نشط",
          "draft": "مسودة"
        },
        "statusDescription": "تفعيل المنتج للعرض في المتجر",
        "variants": {
          "title": "المتغيرات والألوان",
          "subtitle": "أضف متغيرات المنتج المختلفة (الألوان، الأسعار، المخزون)",
          "variantNumber": "متغير #{{number}}"
        },
        "variantFields": {
          "color": "اللون",
          "sku": "رمز SKU",
          "price": "السعر ({{currency}})",
          "comparePrice": "سعر المقارنة ({{currency}})",
          "stock": "الكمية في المخزون",
          "images": "الصور للمتغير",
          "variantImageAlt": "صورة متغير المنتج"
        },
        "placeholders": {
          "productName": "أدخل اسم المنتج...",
          "brand": "العلامة التجارية (اختياري)",
          "description": "أدخل وصفاً مفصلاً للمنتج...",
          "color": "مثال: أحمر، أزرق، إلخ...",
          "sku": "سيتم إنشاؤه تلقائياً",
          "price": "مثال: 199.99",
          "comparePrice": "مثال: 249.99 (اختياري)",
          "stock": "مثال: 50"
        },
        "addVariant": "إضافة متغير جديد (لون)",
        "addImage": "إضافة صورة",
        "uploading": "جارٍ الرفع...",
        "saving": "جارٍ الحفظ...",
        "createProduct": "إنشاء المنتج",
        "updateProduct": "حفظ التغييرات",
        "uploadFailed": "فشل رفع الصورة.",
        "saveFailed": "فشل حفظ المنتج."
      },
      "select": "اختر سبب الرفض",
      "modelrequests": {
        "pageTitle": "طلبات التعاون",
        "pageSubtitle": "راجعي طلبات التعاون الواردة من التجار وقومي بإدارتها بكل سهولة",

        "stats": {
          "total": "إجمالي الطلبات",
          "pending": "بانتظار المراجعة",
          "inProgress": "قيد التنفيذ",
          "completed": "مكتملة"
        },

        "filters": {
          "searchPlaceholder": "ابحث بالتاجر، المنتج، أو الباقة...",
          "statusFilter": "فلتر بحالة الطلب",
          "reset": "إعادة التعيين"
        },

        "status": {
          "all": "جميع الطلبات",
          "pending": "بانتظار الموافقة",
          "accepted": "تم القبول",
          "in_progress": "قيد التنفيذ",
          "completed": "مكتملة",
          "rejected": "مرفوضة"
        },

        "empty": {
          "title": "لا توجد طلبات تعاون",
          "descriptionDefault": "عندما يرسل تاجر طلب تعاون، سيظهر هنا للمراجعة.",
          "descriptionFiltered": "لم نعثر على طلبات تطابق بحثك. حاولي تعديل الفلاتر.",
          "showAll": "عرض جميع الطلبات"
        },

        "card": {
          "package": "باقة الخدمة",
          "product": "المنتج",
          "features": "الميزات المضمنة",
          "additionalFeatures": "+{{count}} ميزات إضافية",
          "unlimited": "غير محدود",
          "reviews": "مراجعات",
          "days": "أيام",
          "priceCurrency": "ر.س"
        },

        "actions": {
          "accept": "قبول الطلب",
          "reject": "رفض",
          "start": "بدء التنفيذ",
          "complete": "إكمال الطلب"
        },

        "rejectDialog": {
          "title": "سبب رفض الطلب",
          "description": "الرجاء تحديد سبب رفض طلب التعاون من {{merchantName}}",
          "reasons": {
            "busy": "مشغولة حالياً",
            "not_suitable": "لا تناسب تخصصي",
            "timing": "غير مناسبة من ناحية التوقيت",
            "budget": "الميزانية غير مناسبة",
            "other": "سبب آخر"
          },
          "placeholderOther": "يرجى توضيح السبب...",
          "cancel": "إلغاء",
          "confirm": "تأكيد الرفض"
        },

        "toasts": {
          "loading": "🔄 جاري تحديث حالة الطلب...",
          "success": "✨ تم تحديث الطلب بنجاح!",
          "error": "❌ فشل تحديث الطلب."
        }
      },
      "AgreementRequests": {
        "title": "طلبات التعاون الواردة",
        "subtitle": "قم بمراجعة طلبات التعاون من التجار وقبولها أو رفضها.",
        "merchantName": "اسم التاجر",
        "offerTitle": "العرض المطلوب",
        "productName": "المنتج",
        "status": {
            "label": "الحالة",
            "pending": "قيد الانتظار",
            "accepted": "مقبول",
            "rejected": "مرفوض",
            "completed": "مكتمل"
        },
        "actions": "إجراءات",
        "accept": "قبول",
        "reject": "رفض",
        "loading": "جاري تحميل الطلبات...",
        "noRequests": "لم يتم العثور على طلبات.",
        "alerts": {
            "success": "تم {{action}} الطلب بنجاح!",
            "accepted": "قبول",
            "rejected": "رفض",
            "error": "فشل تحديث حالة الطلب."
        }
      },
      "OfferForm": {
        "title": "عنوان العرض",
        "description": "الوصف",
        "price": "السعر",
        "offerType": "نوع العرض",
        "offerTypePlaceholder": "اختر النوع...",
        "offerTypes": {
            "story": "ستوري",
            "post": "بوست",
            "reels": "ريلز",
            "photoshoot": "جلسة تصوير"
        },
        "saving": "جاري الحفظ...",
        "saveChanges": "حفظ التعديلات",
        "createOffer": "إنشاء العرض",
        "errors": {
            "saveFailed": "فشل حفظ العرض. الرجاء التأكد من ملء جميع الحقول."
        }
      },
      "ProductCard": {
        "by": "بواسطة:",
        "viewDetails": "عرض التفاصيل",
        "save": "حفظ",
        "reviews": "التقييمات",
        "moreOptions": "خيارات إضافية"
      },
      "ProductDetail": {
        "loading": "جاري التحميل...",
        "notFound": "لم يتم العثور على المنتج.",
        "productImagePlaceholder": "صورة المنتج",
        "by": "بواسطة:",
        "stockQuantity": "الكمية المتبقية",
        "addToCart": "أضف إلى السلة"
      },
      "CartPage": {
        "title": "سلة التسوق",
        "itemsCount": "لديك {{count}} منتج في سلتك",
        "emptyTitle": "سلة التسوق فارغة",
        "emptyDescription": "تبدو فارغة هنا! لم لا تلقي نظرة على منتجاتنا الرائعة؟",
        "continueShopping": "العودة للتسوق",
        "byMerchant": "بواسطة: {{merchant}}",
        "orderSummary": "ملخص الطلب",
        "subtotal": "المجموع الفرعي",
        "shipping": "رسوم الشحن",
        "shippingTBD": "سيتم تحديدها لاحقاً",
        "total": "الإجمالي",
        "checkoutButton": "المتابعة لإتمام الشراء",
        "processing": "جاري المعالجة..."
      },
      "MyOrdersPage": {
        "title": "طلباتي",
        "subtitle": "تتبع جميع طلباتك السابقة والحالية",
        "back": "العودة",
        "exportOrders": "تصدير الطلبات",
        "stats": {
          "total": "إجمالي الطلبات",
          "pending": "قيد الانتظار",
          "shipped": "تم الشحن",
          "completed": "مكتملة"
        },
        "orderHistory": "سجل الطلبات",
        "orderHistoryDescription": "عرض وتتبع جميع طلباتك في مكان واحد",
        "table": {
          "orderId": "رقم الطلب",
          "orderDate": "تاريخ الطلب",
          "status": "الحالة",
          "itemsCount": "عدد المنتجات",
          "total": "الإجمالي",
          "actions": "الإجراءات"
        },
        "tracking": "تتبع",
        "itemsCount": "{{count}} منتج",
        "viewDetails": "التفاصيل",
        "noOrders": {
          "title": "لا توجد طلبات بعد",
          "description": "لم تقم بأي طلبات حتى الآن",
          "browseProducts": "تصفح المنتجات"
        },
        "statusLegend": {
          "title": "شرح حالات الطلبات"
        }
      },
      "OrderDetailsPage": {
        "loading": "جاري تحميل تفاصيل الطلب...",
        "notFound": "لم يتم العثور على الطلب",
        "backToOrders": "العودة للطلبات",
        "orderTitle": "الطلب #{{id}}",
        "share": "مشاركة",
        "downloadInvoice": "تحميل الفاتورة",
        "orderItems": {
          "title": "المنتجات المطلوبة",
          "itemPrice": "{{quantity}} × {{price}} {{currency}}",
          "reviewButton": "تقييم المنتج"
        },
        "summary": {
          "title": "ملخص الطلب",
          "subtotal": "المجموع",
          "shipping": "الشحن",
          "tax": "الضريبة",
          "total": "الإجمالي النهائي"
        },
        "shipping": {
          "title": "عنوان الشحن",
          "noAddress": "لم يتم تحديد عنوان الشحن"
        },
        "support": {
          "title": "بحاجة إلى مساعدة؟",
          "description": "فريق الدعم جاهز لمساعدتك في أي استفسار",
          "contactButton": "تواصل مع الدعم"
        },
        "status": {
          "pending": "قيد الانتظار",
          "processing": "قيد التجهيز",
          "shipped": "تم الشحن",
          "completed": "مكتمل",
          "cancelled": "ملغي"
        },
        "timeline": {
          "title": "تتبع حالة الطلب",
          "pending": {
            "label": "قيد الانتظار",
            "description": "تم استلام طلبك"
          },
          "processing": {
            "label": "قيد التجهيز",
            "description": "جاري تجهيز طلبك"
          },
          "shipped": {
            "label": "تم الشحن",
            "description": "طلبك في الطريق إليك"
          },
          "completed": {
            "label": "مكتمل",
            "description": "تم تسليم الطلب"
          }
        },
        "reviewForm": {
          "dialogTitle": "تقييم المنتج",
          "title": "تقييم المنتج",
          "ratingPrompt": "ما تقييمك لهذا المنتج؟",
          "selectStars": "اختر عدد النجوم",
          "yourRating": "تقييمك: {{rating}} من 5",
          "commentLabel": "أضف تعليقاً (اختياري):",
          "commentPlaceholder": "شاركنا تجربتك مع هذا المنتج...",
          "submitButton": "إرسال التقييم",
          "submitting": "جاري الإرسال...",
          "selectRating": "الرجاء اختيار تقييم",
          "success": "شكراً لك، تم إضافة تقييمك! 🌟",
          "error": "فشل إضافة التقييم. الرجاء المحاولة مرة أخرى."
        }
      },
      "WishlistPage": {
        "title": "قائمة الأمنيات",
        "subtitle": "المنتجات التي أضفتها للمتابعة والشراء لاحقاً.",
        "loading": "جاري تحميل قائمة الأمنيات...",
        "empty": {
          "title": "قائمة أمنياتك فارغة",
          "description": "ابدأ بتصفح مجموعتنا الفاخرة وأضف ما يعجبك للعودة إليه لاحقاً.",
          "browseProducts": "تصفح المنتجات الآن"
        }
      },
      "CustomerDashboard": {
        "welcome": "أهلاً بك، {{name}}!",
        "subtitle": "هنا يمكنك رؤية ملخص نشاطك على منصة لينورا",
        "viewDetails": "عرض التفاصيل",
        "latestOrder": {
          "title": "آخر طلب قمت به",
          "orderId": "طلب رقم #{{id}}",
          "noOrders": "لم تقم بأي طلبات بعد",
          "shopNow": "التسوق الآن"
        },
        "quickActions": {
          "title": "إجراءات سريعة",
          "myOrders": "طلباتي",
          "wishlist": "قائمة الأمنيات",
          "profile": "ملفي"
        }
      },
       "PromotionTiersPage": {
    "title": "إدارة مستويات الترويج",
    "subtitle": "أنشئ وأدر حزم الترويج للمنتجات ذات مستويات الأولوية المختلفة.",
    "sort": {
      "placeholder": "الترتيب حسب",
      "priority": "الأولوية",
      "name": "الاسم",
      "price": "السعر"
    },
    "view": {
      "grid": "شبكة",
      "table": "جدول"
    },
    "actions": {
      "createTier": "إنشاء مستوى",
      "saving": "جارٍ الحفظ...",
      "updateTier": "تحديث المستوى"
    },
    "stats": {
      "totalTiers": "إجمالي المستويات",
      "activeTiers": "المستويات النشطة",
      "highestPrice": "أعلى سعر",
      "maxPriority": "أعلى أولوية"
    },
    "common": {
      "unnamed": "مستوى غير مسمّى"
    },
    "tier": {
      "priority": "الأولوية",
      "duration": "المدة",
      "price": "السعر",
      "features": "المزايا",
      "days_zero": "{{count}} يوم",
      "days_one": "{{count}} يوم",
      "days_two": "{{count}} يومين",
      "days_few": "{{count}} أيام",
      "days_many": "{{count}} يومًا",
      "days_other": "{{count}} يوم"
    },
    "table": {
      "name": "الاسم",
      "status": "الحالة",
      "duration": "المدة",
      "price": "السعر",
      "priority": "الأولوية",
      "color": "اللون",
      "actions": "الإجراءات"
    },
    "form": {
      "createTitle": "إنشاء مستوى ترويج",
      "editTitle": "تعديل مستوى ترويج",
      "createSubtitle": "أنشئ مستوى ترويج جديد لترويج المنتجات.",
      "editSubtitle": "قم بتحديث تفاصيل مستوى الترويج.",
      "nameLabel": "اسم المستوى",
      "namePlaceholder": "مثال: المستوى الذهبي، ترويج مميز",
      "durationLabel": "المدة (أيام)",
      "priceLabel": "السعر ({{currency}})",
      "priorityLabel": "الأولوية",
      "priorityHint": "كلما زاد الرقم زادت ظهوره في الترويج",
      "descriptionLabel": "الوصف",
      "descriptionPlaceholder": "وصف موجز لمزايا هذا المستوى...",
      "featuresLabel": "المزايا",
      "featurePlaceholder": "أضف ميزة...",
      "badgeColorLabel": "لون الشارة",
      "activeLabel": "مستوى نشط"
    },
    "confirmDelete": {
      "title": "هل أنت متأكد؟",
      "description": "لا يمكن التراجع عن هذا الإجراء. سيتم حذف مستوى الترويج \"{{name}}\" بشكل دائم وحذف جميع بياناته المرتبطة.",
      "confirm": "حذف المستوى"
    },
    "toast": {
      "fetchError": "فشل في جلب مستويات الترويج.",
      "deleteSuccess": "تم حذف المستوى بنجاح!",
      "deleteError": "فشل في حذف المستوى.",
      "statusUpdated": "تم {{status}} المستوى",
      "statusError": "فشل في تحديث حالة المستوى.",
      "updateSuccess": "تم تحديث المستوى بنجاح!",
      "createSuccess": "تم إنشاء المستوى بنجاح!",
      "saveError": "حدث خطأ."
    }
  },
  "AdminMessagesPage": {
    "title": "مراقبة المحادثات",
    "subtitle": "راقب وتابع جميع المحادثات بين العارضات والتجار",
    "conversations": {
      "title": "المحادثات",
      "subtitle": "مناقشات نشطة",
      "searchPlaceholder": "البحث في المحادثات...",
      "empty": {
        "title": "لا توجد محادثات",
        "noResults": "لا توجد محادثات تطابق بحثك.",
        "noConversations": "لا توجد محادثات نشطة حتى الآن."
      },
      "withMerchant": "مع {{merchant}}"
    },
    "messages": {
      "selectPrompt": "اختر محادثة",
      "empty": {
        "title": "لا توجد رسائل",
        "noMessages": "لا توجد رسائل في هذه المحادثة بعد.",
        "selectConversation": "اختر محادثة من الشريط الجانبي لعرض الرسائل."
      }
    },
    "roles": {
      "model": "عارضة",
      "merchant": "تاجر"
    },
    "monitoring": "مراقبة",
    "monitoring.info": "أنت تراقب هذه المحادثة. لا يمكن إرسال رسائل في وضع المراقبة."
  },
      "AdminNav": {
        "title":"لوحة تحكم المشرفة",
        "nav": {
          "overview": "نظرة عامة",
          "users": "المستخدمون",
          "messages":"المحادثات",
          "main-banners": "البنرات الرئيسية",
          "Footer":"إعدادات الفوتر",
          "marquee-bar":"الشريط الإعلاني",
          "verification": "التحقق",
          "products": "المنتجات",
          "categories": "التصنيفات",
          "orders": "الطلبات",
          "agreements": "الاتفاقيات",
          "subscriptions": "الاشتراكات",
          "shipping": "الشحن",
          "payouts": "المدفوعات",
          "model payouts": "مدفوعات النماذج",
          "Promotions": "إدارة الترويج",
          "Manage-Subscriptions": "إدارة الاشتراكات",
          "Content": "المحتوى",
          "settings": "الإعدادات"
        }
      },
      "common": {
        "currency": "ريال",
        "locale": "ar-SA",
        "active":"نشط",
        "uploading": "جاري الرفع...",
        "saving": "جاري الحفظ...",
        "retry": "إعادة المحاولة",
        "refresh": "تحديث",
        "visible": "ظاهر",
        "preview": "مشاهده",
        "promote": "ترويج",
        "hidden": "مخفي",
        "users": "المستخدمين",
        "exportData": "تصدير البيانات",
        "system": "النظام",
        "edit": "تعديل",
        "delete": "حذف",
        "cancel": "إلغاء",
        "back": "الرجوع",
        "subscriptionStatus": {
          "active": "نشط",
          "cancelled": "ملغي",
          "inactive": "غير نشط"
        }
      },
      "StoreSettings": {
        "title": "إعدادات المتجر",
        "subtitle": "تعديل المعلومات الأساسية لمتجرك.",
        "storeName": "اسم المتجر",
        "storeDescription": "وصف المتجر",
        "saveChanges": "حفظ التغييرات",
        "saveSuccess": "تم حفظ التغييرات بنجاح!",
        "saveError": "فشل حفظ التغييرات.",
        "loading": "جاري تحميل الإعدادات..."
      },
      "SettingsPage": {
        "exportData": "تصدير البيانات",
        "tabs": {
          "general": "عام",
          "store": "المتجر",
          "social": "التواصل",
          "notifications": "الإشعارات",
          "privacy": "الخصوصية",
          "subscription": "الاشتراك"
        },
        "descriptions": {
          "general": "إدارة الإعدادات الأساسية لحسابك",
          "store": "تخصيص متجرك وعرضه للعملاء",
          "social": "ربط حسابات التواصل الاجتماعي",
          "notifications": "التحكم في الإشعارات والتنبيهات",
          "privacy": "إعدادات الخصوصية والأمان",
          "subscription": "إدارة اشتراكك وباقاتك"
        },
        "fields": {
          "language": "اللغة",
          "currency": "العملة",
          "storeBanner": "غلاف المتجر"
        },
        "languageOptions": {
          "ar": "العربية",
          "en": "English"
        },
        "currencyOptions": {
          "sar": "ريال سعودي (ر.س)",
          "usd": "دولار أمريكي ($)"
        },
        "upload": {
          "dropOrClick": "اسحب وأفلت الصورة هنا أو انقر للاختيار",
          "changeImage": "تغيير الصورة",
          "failed": "فشل رفع صورة الغلاف."
        },
        "socialPlaceholders": {
          "instagram": "https://instagram.com/username",
          "twitter": "https://x.com/username",
          "facebook": "https://facebook.com/username"
        },
        "notifications": {
          "email": "البريد الإلكتروني",
          "emailDesc": "إشعارات عبر البريد الإلكتروني",
          "push": "الإشعارات",
          "pushDesc": "إشعارات التطبيق",
          "sms": "رسائل SMS",
          "smsDesc": "إشعارات عبر الرسائل النصية"
        },
        "privacy": {
          "showEmail": "عرض البريد الإلكتروني",
          "showEmailDesc": "السماح للآخرين برؤية بريدك الإلكتروني",
          "showPhone": "عرض رقم الهاتف",
          "showPhoneDesc": "السماح للآخرين برؤية رقم هاتفك"
        },
        "subscription": {
          "month": "شهر",
          "startDate": "بدأ في:",
          "endDate": "ينتهي في:",
          "noActive": "لا يوجد اشتراك نشط",
          "upgradePrompt": "اشترك في إحدى باقاتنا للاستفادة من الميزات المتقدمة",
          "viewPlans": "عرض الباقات",
          "cancelButton": "إلغاء الاشتراك",
          "cancelFailed": "فشل إلغاء الاشتراك.",
          "cancelConfirm": {
            "title": "هل أنت متأكد من الإلغاء؟",
            "description": "سيؤدي هذا إلى إلغاء التجديد التلقائي. ستظل ميزاتك متاحة حتى نهاية فترة الفوترة الحالية.",
            "confirm": "نعم، قم بالإلغاء"
          }
        }
      },
      "ModelNav": {
        "nav": {
          "overview": "نظرة عامة",
          "offers": "عروضي",
          "wallet": "محفظتي",
          "reels":"ريلز",
          "mySubscription": "إشتراكي",
          "verification": "التحقق",
          "subscribe":"إشترك",
          "requests": "الطلبات",
          "profile": "تعديل الملف الشخصي",
          "messages": "المحادثه",
          "analytics": "التحليلات",
          "settings": "الإعدادات"
        }
      },
      "MerchantDashboard": {
        "loading": "جارٍ تحميل لوحة التحكم...",
        "errors": {
          "loadFailed": "فشل تحميل بيانات لوحة التحكم."
        },
        "welcomeBack": "مرحباً بعودتك! 👋",
        "storeSummary": "هنا ملخص أداء متجرك لهذا اليوم",
        "stats": {
          "totalSales": "إجمالي المبيعات",
          "averageRating": "التقييم العام",
          "fromReviews": "من {{count}} تقييم",
          "monthlyViews": "مشاهدات هذا الشهر",
          "activeProducts": "المنتجات النشطة",
          "newOrders": "طلبات جديدة"
        },
        "salesSummary": "ملخص المبيعات",
        "salesPerformance": "عرض أداء المبيعات للفترة المحددة",
        "thisWeek": "هذا الأسبوع",
        "thisMonth": "هذا الشهر",
        "recentOrders": "أحدث الطلبات",
        "lastOrders": "آخر {{count}} طلبات تم استلامها",
        "noRecentOrders": "لا توجد طلبات حديثة",
        "viewAllOrders": "عرض جميع الطلبات",
        "orderNumber": "طلب رقم #{{id}}"
      },
      "ProductsPage": {
    "title": "إدارة المنتجات",
    "subtitle": "ادمن منتجاتك ومتغيراتها بكل سهولة",
    "addProduct": "إضافة منتج جديد",
    "loading": "جارٍ تحميل المنتجات...",
    "stats": {
      "totalProducts": "إجمالي المنتجات",
      "activeProducts": "المنتجات النشطة",
      "variants": "المتغيرات",
      "lowStock": "منخفضة المخزون"
    },
    "status": {
      "active": "نشط",
      "draft": "مسودة"
    },
    "stock": {
      "outOfStock": "نفذت الكمية",
      "lowStock": "كمية قليلة",
      "inStock": "متوفر"
    },
    "variants": "المتغيرات",
    "variant": {
      "color": "اللون",
      "price": "السعر",
      "stock": "المخزون",
      "sku": "SKU",
      "images": "الصور",
      "noImages": "لا توجد صور"
    },
    "empty": {
      "title": "لا توجد منتجات بعد",
      "subtitle": "ابدأ بإنشاء أول منتج لك في المتجر",
      "createFirst": "إنشاء أول منتج"
    },
    "createProduct": "إنشاء منتج جديد",
    "editProduct": "تعديل المنتج",
    "deleteFailed": "فشل حذف المنتج.",
    "confirmDelete": {
      "title": "هل أنت متأكد من الحذف؟",
      "message": "سيتم حذف المنتج \"{{name}}\" وجميع متغيراته بشكل دائم.",
      "confirm": "نعم، احذف المنتج"
    }
  },
  "ModelAnalytics": {
    "loading": "جاري تحميل التحليلات...",
    "error": {
      "title": "فشل تحميل البيانات",
      "description": "عفواً، لا يمكن تحميل بيانات التحليلات حالياً."
    },
    "title": "تحليلات الأداء",
    "subtitle": "نظرة عميقة على أدائك وأرباحك في المنصة لتحقيق أفضل النتائج",
    "timeRange": {
      "month": "شهري",
      "quarter": "ربع سنوي",
      "year": "سنوي"
    },
    "stats": {
      "totalEarnings": "إجمالي الأرباح",
      "totalEarningsGrowth": "+12% زيادة عن الشهر الماضي",
      "completedAgreements": "التعاونات المكتملة",
      "completedAgreementsGrowth": "+8% زيادة عن الشهر الماضي",
      "averageDealPrice": "متوسط سعر الصفقة",
      "averageDealPriceGrowth": "+5% زيادة عن الشهر الماضي",
      "engagementRate": "معدل التفاعل",
      "engagementRateGrowth": "+15% زيادة عن الشهر الماضي"
    },
    "chart": {
      "title": "طلبات التعاون (آخر 6 أشهر)"
    },
    "performance": {
      "title": "مؤشرات الأداء",
      "engagement": "معدل التفاعل",
      "profileViews": "مشاهدات الملف",
      "satisfaction": "رضا العملاء",
      "growth": "+{{percent}}% عن الشهر الماضي"
    },
    "topOffers": {
      "title": "أفضل 5 عروض أداءً",
      "headers": {
        "offer": "العرض",
        "price": "السعر",
        "requests": "الطلبات"
      }
    },
    "insights": {
      "title": "رؤى إضافية",
      "profileViews": "مشاهدات الملف الشخصي",
      "rating": "تقييم العملاء",
      "completionRate": "معدل الإنجاز"
    }
  },
  "modelwallet": {
    "pageTitle": "محفظتي المالية",
    "pageSubtitle": "إدارة أرباحك، تتبع معاملاتك، وسحب أموالك بكل أمان وسهولة",

    "overview": {
      "availableBalance": "الرصيد المتاح",
      "pendingEarnings": "أرباح معلقة",
      "totalEarnings": "إجمالي الأرباح",
      "thisMonth": "هذا الشهر"
    },

    "payout": {
      "title": "طلب سحب جديد",
      "description": "اسحبي أرباحك إلى حسابك البنكي أو محفظتك الإلكترونية",
      "amountLabel": "المبلغ المطلوب (ر.س)",
      "amountPlaceholder": "أدخل المبلغ الذي ترغبين في سحبه",
      "minAmount": "الحد الأدنى: {{min}} ر.س",
      "available": "المتاح: {{balance}} ر.س",
      "methodLabel": "طريقة الاستلام",
      "quickAmounts": "مبالغ سريعة",
      "securityNotice": {
        "title": "معلومات أمان",
        "description": "جميع المعاملات مؤمنة ومشفرة. يتم معالجة طلبات السحب خلال 1-3 أيام عمل."
      },
      "submit": "تأكيد طلب السحب",
      "submitting": "جاري إرسال الطلب...",
      "confirmDialog": {
        "title": "تأكيد طلب السحب",
        "description": "هل أنت متأكدة من رغبتك في سحب {{amount}} ريال؟",
        "amount": "المبلغ:",
        "method": "طريقة السحب:",
        "cancel": "إلغاء",
        "confirm": "تأكيد السحب",
        "processing": "جاري المعالجة..."
      }
    },

    "transactions": {
      "title": "آخر المعاملات",
      "timeRange": {
        "week": "أسبوع",
        "month": "شهر",
        "year": "سنة"
      },
      "noTransactions": "لا توجد معاملات",
      "viewAll": "عرض الكل",
      "status": {
        "completed": "مكتمل",
        "pending": "قيد الانتظار",
        "failed": "فاشل"
      },
      "types": {
        "earning": "إيراد",
        "payout": "سحب",
        "refund": "استرداد"
      }
    },

    "summary": {
      "title": "ملخص الأرباح",
      "totalRevenue": "إجمالي الإيرادات",
      "totalPayouts": "إجمالي المسحوبات",
      "netBalance": "صافي الرصيد"
    },

    "errors": {
      "invalidAmount": "❌ الرجاء إدخال مبلغ صحيح.",
      "minAmount": "❌ الحد الأدنى للسحب هو {{min}} ريال.",
      "insufficientBalance": "❌ المبلغ المطلوب يتجاوز رصيدك المتاح.",
      "noMethod": "❌ الرجاء اختيار طريقة السحب.",
      "fetchFailed": "❌ فشل في جلب بيانات المحفظة.",
      "payoutFailed": "❌ حدث خطأ أثناء إرسال الطلب."
    },

    "success": {
      "payoutRequested": "✨ تم إرسال طلب السحب بنجاح!"
    },

    "loading": "جاري تحميل بيانات المحفظة...",
    "availableNow": "قابل للسحب فوراً",
    "underReview": "قيد المراجعة والتحويل",
    "allTimeEarnings": "جميع أرباحك حتى الآن",
    "currentMonthEarnings": "أرباح الشهر الحالي",
    "default": "افتراضي"
  },
  "MerchantAgreements": {
    "title": "اتفاقياتي",
    "subtitle": "إدارة ومتابعة جميع اتفاقيات التعاون مع العارضات والمؤثرين",
    "loading": "جاري تحميل الاتفاقيات...",
    "export": "تصدير البيانات",
    "search": {
      "placeholder": "ابحث باسم العارضة أو عنوان العرض..."
    },
    "stats": {
      "total": "إجمالي الاتفاقيات",
      "pending": "بانتظار الموافقة",
      "accepted": "قيد التنفيذ",
      "completed": "مكتملة",
      "totalValue": "إجمالي القيمة"
    },
    "status": {
      "pending": "بانتظار الموافقة",
      "accepted": "قيد التنفيذ",
      "rejected": "مرفوض",
      "completed": "مكتمل"
    },
    "empty": {
      "title": "لا توجد اتفاقيات",
      "filtered": "لم نعثر على اتفاقيات تطابق معايير البحث",
      "noData": "لم تقم بإنشاء أي اتفاقيات حتى الآن",
      "clearSearch": "مسح البحث"
    },
    "table": {
      "title": "قائمة الاتفاقيات",
      "description": "إدارة ومتابعة جميع اتفاقيات التعاون ({{count}} اتفاقية)",
      "count": "{{count}} اتفاقية",
      "headers": {
        "model": "العارضة/المؤثر",
        "offer": "العرض",
        "status": "الحالة",
        "value": "القيمة",
        "actions": "الإجراءات"
      }
    },
    "actions": {
      "confirmCompletion": "تأكيد الإكمال",
      "completing": "جاري الإكمال...",
      "details": "التفاصيل"
    },
    "dialog": {
      "review": {
        "title": "تقييم التعاون",
        "description": "تقييم التعاون مع {{name}}",
        "ratingLabel": "ما هو تقييمك للعمل؟",
        "ratingValue": "{{count}} من 5 نجوم",
        "commentLabel": "تعليق إضافي (اختياري)",
        "commentPlaceholder": "صف تجربتك، نقاط القوة، أو أي ملاحظات أخرى...",
        "confirm": "تأكيد الإكمال",
        "confirming": "جاري التأكيد..."
      }
    },
    "toast": {
      "fetchError": "❌ فشل في جلب الاتفاقيات.",
      "exportPreparing": "📥 جاري تحضير بيانات التصدير...",
      "ratingRequired": "الرجاء تحديد تقييم (نجمة واحدة على الأقل).",
      "completing": "🔄 جاري إكمال الاتفاق وحفظ التقييم...",
      "completeSuccess": "✨ تم إكمال وتقييم الاتفاق بنجاح!",
      "completeError": "❌ فشلت العملية. حاول مرة أخرى.",
      "unexpectedError": "❌ حدث خطأ غير متوقع."
    },
    "rating": {
      "star": "{{count}} نجمة"
    }
  },

  "DropshippingPage": {
  "title": "منتجات الدروبشيبينغ",
  "subtitle": "اختر من بين آلاف المنتجات الجاهزة وأضفها لمتجرك بضغطة زر",
  "stats": {
    "totalProducts": "إجمالي المنتجات",
    "featured": "منتجات مميزة",
    "suppliers": "موردين",
    "totalValue": "إجمالي القيمة"
  },
  "search": {
    "placeholder": "ابحث عن المنتجات بالاسم، الماركة، أو التصنيف..."
  },
  "filters": {
    "allCategories": "جميع التصنيفات",
    "clear": "مسح الفلاتر"
  },
  "actions": {
    "export": "تصدير البيانات",
    "refresh": "تحديث",
    "addToStore": "أضف للمتجر",
    "importing": "جارٍ الاستيراد..."
  },
  "results": {
    "product_one": "منتج",
    "product_two": "منتجان",
    "product_few": "منتجات",
    "product_many": "منتج",
    "product_other": "منتج"
  },
  "loading": "جاري تحميل المنتجات...",
  "currency": "ر.س",
  "badge": {
    "featured": "مميز"
  },
  "product": {
    "supplier": "المورد"
  },
  "empty": {
    "title": "لا توجد منتجات",
    "noProducts": "لا توجد منتجات متاحة حاليًا",
    "noResults": "لم نعثر على منتجات تطابق معايير البحث",
    "viewAll": "عرض جميع المنتجات"
  },
  "gate": {
    "title": "هذه الميزة حصرية للمشتركين",
    "description": "للوصول إلى منتجات الدروبشيبينغ وبدء البيع فورًا، يرجى الاشتراك في إحدى الباقات التي تدعم هذه الخدمة.",
    "action": "عرض باقات الاشتراك"
  },
  "success": {
    "import": "تم استيراد المنتج إلى متجرك بنجاح!"
  },
  "errors": {
    "fetchFailed": "فشل في جلب منتجات الدروبشيبينغ.",
    "importFailed": "فشل في استيراد المنتج. قد يكون المنتج موجودًا بالفعل في متجرك."
  },
  "info": {
    "exporting": "جارٍ تحضير بيانات التصدير..."
  }
},
  "ProfilePage": {
    "title": "ملفي الشخصي",
    "subtitle": "إدارة معلوماتك الشخصية والتفضيلات",
    "tabs": {
      "personal": "المعلومات الشخصية",
      "contact": "معلومات الاتصال",
      "addresses": "العناوين",
      "security": "الأمان"
    },
    "fields": {
      "fullName": "الاسم الكامل",
      "email": "عنوان البريد الإلكتروني",
      "phone": "رقم الهاتف",
      "shippingAddress": "عنوان الشحن"
    },
    "passwordInstructions": "اترك الحقول فارغة للحفاظ على كلمة المرور الحالية.",
    "newPassword": "كلمة المرور الجديدة",
    "confirmPassword": "تأكيد كلمة المرور الجديدة",
    "saveChanges": "حفظ التغييرات",
    "saving": "جارٍ الحفظ...",
    "passwordMismatch": "كلمتا المرور غير متطابقتين.",
    "updateSuccess": "تم تحديث الملف الشخصي بنجاح!",
    "updateError": "فشل تحديث الملف الشخصي.",
  "toasts": {
    "saving": "جارٍ الحفظ...",
    "addressSaved": "تم حفظ العنوان بنجاح!",
    "loadAddressesError": "فشل تحميل العناوين.",
    "invalidImage": "يرجى رفع ملف صورة صالح.",
    "fileTooLarge": "يجب أن يكون الملف أقل من 5 ميجابايت.",
    "uploading": "جارٍ الرفع...",
    "pictureUpdated": "تم تحديث صورة الملف الشخصي!",
    "addressDeleted": "تم حذف العنوان بنجاح!"
  },
  "addressForm": {
    "addTitle": "إضافة عنوان جديد",
    "editTitle": "تعديل العنوان",
    "address": "العنوان (السطر الأول)",
    "addressPlaceholder": "مثال: 123 شارع رئيسي",
    "addressRequired": "العنوان مطلوب",
    "city": "المدينة",
    "cityRequired": "المدينة مطلوبة",
    "state": "المنطقة / الولاية",
    "stateRequired": "المنطقة مطلوبة",
    "postalCode": "الرمز البريدي",
    "postalCodeRequired": "الرمز البريدي مطلوب",
    "country": "البلد",
    "countryRequired": "البلد مطلوب",
    "isDefault": "تعيين كعنوان الشحن الافتراضي"
  },
  "addressList": {
    "title": "العناوين المحفوظة",
    "description": "إدارة عناوين التوصيل الخاصة بك",
    "addNew": "إضافة عنوان",
    "addFirst": "أضف أول عنوان لك",
    "empty": "لم تقم بإضافة أي عناوين بعد.",
    "default": "افتراضي"
  },
  "deleteDialog": {
    "title": "حذف العنوان؟",
    "description": "لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد من أنك تريد حذف هذا العنوان؟"
  }
},
  "MessagesPage": {
    "title": "الرسائل",
    "conversations": "المحادثات",
    "loadingConversations": "جارٍ التحميل...",
    "noConversations": "لا توجد محادثات بعد.",
    "online": "متصل الآن",
    "lastSeen": {
      "label": "آخر ظهور",
      "unknown": "غير معروف"
    },
    "loadingMessages": "جارٍ تحميل الرسائل...",
    "messagePlaceholder": "اكتب رسالتك...",
    "sendMessageFailed": "فشل إرسال الرسالة.",
    "fileUploadFailed": "فشل إرسال الملف.",
    "attachment": "مرفق",
    "attachmentImageAlt": "صورة مرفقة",
    "attachmentFile": "ملف مرفق",
    "selectConversation": "اختر محادثة",
    "selectConversationHint": "لعرض الرسائل أو بدء محادثة جديدة."
  },
  "AdminProductsPage": {
    "title": "إدارة المنتجات",
    "subtitle": "عرض وتعديل جميع المنتجات على المنصة.",
    "productsList": "قائمة المنتجات",
    "foundProducts": "تم العثور على {{count}} منتج",
    "searchPlaceholder": "ابحث بالاسم أو اسم التاجر...",
    "loading": "جارٍ التحميل...",
    "noProducts": "لا توجد منتجات.",
    "table": {
      "product": "المنتج",
      "merchant": "التاجر",
      "status": "الحالة",
      "variants": "المتغيرات",
      "actions": "الإجراءات"
    },
    "status": {
      "active": "نشط",
      "draft": "مسودة"
    },
    "actions": {
      "view": "عرض المنتج",
      "activate": "تفعيل المنتج",
      "deactivate": "إلغاء التفعيل",
      "delete": "حذف المنتج"
    },
    "confirmDelete": {
      "title": "هل أنت متأكد من الحذف؟",
      "message": "سيتم حذف المنتج \"{{name}}\" بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
      "confirm": "نعم، قم بالحذف"
    },
    "statusUpdateFailed": "فشل تحديث حالة المنتج.",
    "deleteFailed": "فشل حذف المنتج."
  },
  "UploadReelPage": {
    "title": "رفع ريل جديد",
    "subtitle": "شارك أسلوبك مع العالم من خلال محتوى فيديو جميل",
    "form": {
      "title": "إنشاء ريل جديد",
      "subtitle": "قم برفع الفيديو الخاص بك وأضف تفاصيل جذابة"
    },
    "video": {
      "label": "ملف الفيديو",
      "selectPrompt": "اختر ملف فيديو",
      "supportedFormats": "التنسيقات المدعومة: MP4، MOV، MKV، AVI"
    },
    "preview": {
      "title": "معاينة",
      "placeholder": "ستظهر معاينة الفيديو هنا"
    },
    "caption": {
      "label": "الوصف",
      "placeholder": "شارك قصتك، أو صف أسلوبك، أو أضف وصفًا جذابًا...",
      "chars": "{{current}}/{{max}} حرف"
    },
    "taggedProducts": {
      "title": "المنتجات المُوسومة",
      "count": "{{count}} منتج{{count, plural, zero {} one {} two {} few {} many {} other {ات}}}",
      "tagProducts": "وسّم منتجات",
      "manageProducts": "إدارة المنتجات المُوسومة",
      "activeAgreements": "الاتفاقيات النشطة",
      "fromMerchant": "من: {{store}}",
      "allProducts": "جميع المنتجات"
    },
    "agreement": {
      "linked": "مرتبط باتفاقية نشطة",
      "id": "سيتم ربط هذا الريل بمعرف الاتفاقية: {{id}}"
    },
    "actions": {
      "uploading": "جارٍ الرفع...",
      "uploadReel": "رفع الريل"
    },
    "validation": {
      "videoRequired": "ملف الفيديو مطلوب.",
      "maxCaption": "يجب أن يكون الوصف 1000 حرف كحد أقصى"
    },
    "toast": {
      "fetchError": "تعذر تحميل المنتجات أو الاتفاقيات النشطة.",
      "uploadSuccess": "تم رفع الفيديو بنجاح!",
      "uploadError": "فشل الرفع"
    }
  },
  "AdminOrdersPage": {
    "title": "إدارة الطلبات",
    "subtitle": "مراقبة جميع الطلبات والمعاملات في المنصة.",
    "loading": "جارٍ التحميل...",
    "loadingDetails": "جارٍ تحميل التفاصيل...",
    "detailsLoadFailed": "فشل جلب تفاصيل الطلب.",
    "noOrders": "لا توجد طلبات مطابقة.",
    "orderList": "سجل الطلبات",
    "foundOrders": "إجمالي {{count}} طلب مطابق للبحث.",
    "searchPlaceholder": "ابحث...",
    "filterByStatus": "فلترة بالحالة",
    "status": {
      "all": "الكل",
      "pending": "قيد الانتظار",
      "processing": "قيد التجهيز",
      "shipped": "تم الشحن",
      "completed": "مكتمل",
      "cancelled": "ملغي"
    },
    "table": {
      "orderNumber": "رقم الطلب",
      "customer": "العميل",
      "date": "التاريخ",
      "status": "الحالة",
      "total": "الإجمالي",
      "actions": "الإجراءات"
    },
    "stats": {
      "totalOrders": "إجمالي الطلبات",
      "completedOrders": "طلبات مكتملة",
      "pendingOrders": "طلبات قيد الانتظار",
      "totalRevenue": "إجمالي الإيرادات"
    },
    "orderDetails": "تفاصيل الطلب #{{id}}",
    "customerInfo": "العميل: {{name}} ({{email}})",
    "products": "المنتجات",
    "total": "الإجمالي"
  },
  "supplierorders": {
  "pageTitle": "طلبات المورّد",
  "pageSubtitle": "قم بإدارة وتتبع جميع طلباتك من التجار والعملاء.",
  "toasts": {
    "fetchError": "فشل تحميل الطلبات. يرجى المحاولة مرة أخرى.",
    "detailsError": "فشل تحميل تفاصيل الطلب.",
    "updateSuccess": "تم تحديث حالة الطلب بنجاح!",
    "updateError": "فشل تحديث حالة الطلب. يرجى المحاولة مرة أخرى."
  },
  "status": {
    "pending": "قيد الانتظار",
    "processing": "قيد المعالجة",
    "shipped": "تم الشحن",
    "completed": "مكتمل",
    "cancelled": "ملغى"
  },
  "table": {
    "headers": {
      "orderId": "رقم الطلب",
      "customer": "العميل",
      "store": "المتجر",
      "product": "المنتج",
      "earnings": "الأرباح",
      "date": "التاريخ",
      "status": "الحالة"
    },
    "loading": "جارٍ تحميل الطلبات...",
    "quantity": "{{quantity}} وحدة",
    "totalEarnings": "الإجمالي: {{total}}",
    "empty": {
      "title": "لا توجد طلبات بعد",
      "description": "ليس لديك أي طلبات في الوقت الحالي."
    }
  },
  "modal": {
    "title": "الطلب #{{orderId}}",
    "date": "تم إنشاؤه في: {{date}}",
    "customerInfo": "معلومات العميل",
    "shippingAddress": "عنوان الشحن",
    "itemsInOrder": "المنتجات في الطلب",
    "quantity": "الكمية",
    "totalCost": "التكلفة الإجمالية",
    "productDetails": "المنتج",
    "salePrice": "سعر البيع",
    "productEarnings": "أرباح المنتج",
    "shippingEarnings": "أرباح الشحن",
    "total": "إجمالي الأرباح",
    "paymentDetails": "تفاصيل الدفع",
    "paymentMethod": "طريقة الدفع",
    "shippingCost": "تكلفة الشحن",
    "orderTotal": "إجمالي الطلب",
    "updateStatus": "تحديث حالة الطلب",
    "statusPlaceholder": "اختر الحالة الجديدة",
    "updating": "جارٍ التحديث...",
    "saveChanges": "حفظ التغييرات"
  }
},
  "payment":{
    "card": "بطاقة ائتمان/خصم",
    "cod": "الدفع عند الاستلام"
  },
  "suppliershipping": {
    "pageTitle": "إدارة الشحن",
    "pageSubtitle": "أضف وعدّل شركات الشحن التي تتعامل معها",

    "actions": {
      "addCompany": "إضافة شركة جديدة",
      "edit": "تعديل",
      "delete": "حذف",
      "cancel": "إلغاء",
      "saveChanges": "حفظ التعديلات",
      "addCompanyButton": "إضافة الشركة"
    },

    "table": {
      "headers": {
        "name": "اسم الشركة",
        "cost": "تكلفة الشحن",
        "actions": "الإجراءات"
      },
      "loading": "جاري تحميل شركات الشحن...",
      "empty": {
        "title": "لا توجد شركات شحن",
        "description": "ابدأ بإضافة أول شركة شحن لك"
      }
    },

    "form": {
      "title": {
        "add": "إضافة شركة شحن جديدة",
        "edit": "تعديل شركة شحن"
      },
      "labels": {
        "name": "اسم الشركة",
        "cost": "تكلفة الشحن (ر.س)"
      },
      "placeholders": {
        "name": "مثال: أرامكس",
        "cost": "مثال: 35.50"
      },
      "errors": {
        "nameRequired": "❌ اسم الشركة مطلوب.",
        "invalidCost": "❌ تكلفة الشحن يجب أن تكون رقمًا غير سالب."
      }
    },

    "toasts": {
      "fetchError": "❌ فشل في جلب شركات الشحن.",
      "saveSuccess": {
        "add": "✨ تمت إضافة شركة الشحن بنجاح.",
        "update": "✨ تم تحديث شركة الشحن بنجاح."
      },
      "deleteSuccess": "🗑️ تم حذف شركة الشحن بنجاح.",
      "deleteError": "❌ فشل حذف شركة الشحن.",
      "genericError": "❌ حدث خطأ ما."
    },

    "dialogs": {
      "delete": {
        "title": "هل أنت متأكد؟",
        "description": "سيتم حذف شركة الشحن '{{name}}' بشكل نهائي.",
        "warning": "لا يمكن التراجع عن هذا الإجراء.",
        "confirm": "نعم، احذف الشركة"
      }
    },

    "badges": {
      "companyCount": "{{count}} شركة شحن"
    }
  },
  "AdminModelPayouts": {
  "title": "طلبات سحب العارضات",
  "subtitle": "مراجعة وإدارة طلبات سحب الأرباح للعارضات على المنصة.",
  "table": {
    "model": "العارضة",
    "email": "البريد الإلكتروني",
    "amount": "المبلغ",
    "status": "الحالة",
    "date": "تاريخ الطلب",
    "actions": "الإجراءات",
    "viewDetails": "عرض التفاصيل",
    "approve": "قبول",
    "reject": "رفض"
  },
  "stats": {
    "totalRequests": "إجمالي الطلبات",
    "pendingRequests": "قيد الانتظار",
    "approvedRequests": "تمت الموافقة",
    "rejectedRequests": "مرفوضة",
    "pendingAmount": "إجمالي المبالغ المعلقة"
  },
  "status": {
    "pending": "قيد الانتظار",
    "approved": "تمت الموافقة",
    "rejected": "مرفوض"
  },
  "dialog": {
    "title": "تفاصيل طلب السحب",
    "requestAmount": "طلب سحب بقيمة {{amount}} {{currency}}",
    "modelInfo": "معلومات العارضة",
    "requestDate": "تاريخ الطلب"
  },
  "actions": {
    "exportData": "تصدير البيانات",
    "refresh": "تحديث"
  },
  "search": {
    "placeholder": "ابحث بالاسم أو البريد الإلكتروني..."
  },
  "empty": {
    "noRequests": "لا توجد طلبات سحب معلقة حالياً.",
    "noResults": "لم نعثر على طلبات تطابق معايير البحث."
  },
  "loading": "جاري تحميل طلبات السحب...",
  "toast": {
    "fetchError": "فشل في جلب طلبات السحب.",
    "updateSuccess": "تم تحديث الطلب بنجاح!",
    "updateError": "فشل في تحديث حالة الطلب."
  }
},
  "AdminShipping": {
    "title": "إدارة الشحن",
    "subtitle": "أدر شركات الشحن الخاصة بك، ومفاتيح الـ API، وحالة التفعيل من لوحة تحكم واحدة.",
    "stats": {
      "totalCompanies": "إجمالي الشركات",
      "activeCompanies": "الشركات النشطة"
    },
    "status": {
      "active": "نشط",
      "inactive": "غير نشط"
    },
    "filters": {
      "all": "الكل"
    },
    "searchPlaceholder": "ابحث باسم الشركة...",
    "actions": {
      "refresh": "تحديث",
      "export": "تصدير",
      "addCompany": "إضافة شركة"
    },
    "shippingCompanies": "شركات الشحن",
    "foundCompanies": "عُثر على شركة واحدة",
    "foundCompanies_plural": "عُثر على {{count}} شركة",
    "table": {
      "companyName": "اسم الشركة",
      "apiKey": "مفتاح الـ API",
      "status": "الحالة",
      "actions": "الإجراءات",
      "notAvailable": "غير متوفر",
      "noResults": "لا توجد شركات تطابق بحثك أو التصفية.",
      "empty": "لم تُضف أي شركات شحن بعد."
    },
    "noCompanies": "لم يُعثر على شركات",
    "loading": "جارٍ تحميل شركات الشحن...",
    "addNewCompany": "إضافة شركة جديدة",
    "editCompany": "تعديل الشركة",
    "form": {
      "name": "اسم الشركة",
      "apiKey": "مفتاح الـ API (اختياري)",
      "active": "حالة التفعيل"
    },
    "toast": {
      "fetchError": {
        "title": "فشل تحميل شركات الشحن."
      },
      "saveError": {
        "title": "فشل حفظ الشركة."
      },
      "addSuccess": {
        "title": "تمت إضافة الشركة بنجاح!"
      },
      "updateSuccess": {
        "title": "تم تحديث الشركة بنجاح!"
      },
      "statusUpdateFailed": "فشل تحديث حالة الشركة."
    }
  },
  "AdminPromotions": {
    "title": "إدارة ترويج المنتجات",
    "subtitle": "تحكم في باقات الترويج ووافق على طلبات التجار",
    "stats": {
      "totalRequests": "إجمالي الطلبات",
      "pendingRequests": "طلبات معلقة",
      "approvedRequests": "طلبات مفعلة",
      "totalTiers": "باقات الترويج",
      "activeTiers": "باقات نشطة",
      "totalRevenue": "إجمالي الإيرادات"
    },
    "searchPlaceholder": "ابحث باسم المنتج أو التاجر أو الباقة...",
    "actions": {
      "export": "تصدير البيانات",
      "refresh": "تحديث"
    },
    "tabs": {
      "requests": "طلبات الترويج ({{count}})",
      "tiers": "باقات الترويج ({{count}})"
    },
    "requests": {
      "title": "طلبات الترويج المعلقة",
      "description": "هذه الطلبات بانتظار موافقتك بعد أن قام التاجر بالدفع (طلب واحد)",
      "description_plural": "هذه الطلبات بانتظار موافقتك بعد أن قام التاجر بالدفع ({{count}} طلب)",
      "table": {
        "product": "المنتج",
        "merchant": "التاجر",
        "tier": "الباقة",
        "price": "السعر",
        "status": "الحالة",
        "date": "تاريخ الطلب",
        "actions": "الإجراءات"
      },
      "noRequests": "لا توجد طلبات",
      "noResults": "لم نعثر على طلبات تطابق معايير البحث",
      "empty": "لا توجد طلبات ترويج معلقة حالياً",
      "loading": "جاري تحميل طلبات الترويج...",
      "activate": "تفعيل",
      "viewDetails": "التفاصيل"
    },
    "tiers": {
      "title": "إدارة باقات الترويج",
      "description": "تحكم في الباقات التي يمكن للتجار شراؤها (باقة واحدة)",
      "description_plural": "تحكم في الباقات التي يمكن للتجار شراؤها ({{count}} باقة)",
      "createNew": "إنشاء باقة جديدة",
      "editTier": "تعديل الباقة",
      "createFirst": "إنشاء أول باقة",
      "noTiers": "لا توجد باقات",
      "empty": "لم يتم إنشاء أي باقات ترويج حتى الآن",
      "loading": "جاري تحميل باقات الترويج...",
      "duration": "{{count}} يوم",
      "duration_plural": "{{count}} أيام",
      "priceLabel": "السعر",
      "durationLabel": "المدة",
      "activateLabel": "تفعيل الباقة"
    },
    "form": {
      "tierName": "اسم الباقة",
      "tierNamePlaceholder": "أدخل اسم الباقة (مثال: ترويج ذهبي)",
      "durationDays": "المدة (بالأيام)",
      "durationPlaceholder": "7",
      "priceSAR": "السعر (بالريال)",
      "pricePlaceholder": "99.99",
      "saveTier": "حفظ الباقة"
    },
    "status": {
      "pending": "قيد الانتظار",
      "approved": "تمت الموافقة",
      "rejected": "مرفوض"
    },
    "toast": {
      "fetchError": "❌ فشل في جلب بيانات الترويج.",
      "createTierSuccess": "✅ تم إنشاء الباقة بنجاح.",
      "createTierError": "❌ فشل في إنشاء الباقة.",
      "updateTierSuccess": "✅ تم تحديث الباقة بنجاح.",
      "updateTierError": "❌ فشل في تحديث الباقة.",
      "approveRequestSuccess": "✅ تمت الموافقة على الطلب وتفعيله.",
      "approveRequestError": "❌ فشل في الموافقة على الطلب.",
      "exportPreparing": "📥 جاري تحضير بيانات التصدير..."
    }
  },

  "supplierdashboard": {
    "loading": "جاري تحميل البيانات...",

    "verification": {
      "title": "تحقق الحساب",
      "pending": {
        "title": "طلبك قيد المراجعة",
        "description": "تم تقديم مستندات التحقق الخاصة بك وهي قيد المراجعة حالياً. سنقوم بإعلامك عبر البريد الإلكتروني بمجرد اكتمال العملية."
      },
      "required": {
        "title": "مطلوب التحقق",
        "description": "حسابك غير مؤكد بعد. يرجى إكمال عملية التحقق للوصول إلى لوحة التحكم وبدء بيع المنتجات.",
        "button": "الذهاب إلى التحقق"
      }
    },

    "welcome": "أهلاً بك، {{name}}!",
    "subtitle": "نظرة عامة على أعمال الدروب شيبنج الخاصة بك",

    "stats": {
      "availableBalance": "الرصيد المتاح",
      "totalProducts": "إجمالي المنتجات",
      "totalOrders": "إجمالي الطلبات",
      "totalStock": "إجمالي المخزون"
    },

    "quickActions": {
      "title": "الإجراءات السريعة",
      "addProduct": "إضافة منتج جديد",
      "viewOrders": "عرض الطلبات",
      "manageInventory": "إدارة المخزون",
      "reports": "التقارير"
    },

    "currency": "ر.س"
  },
  "supplierproductform": {
    "title": {
      "add": "إضافة منتج جديد",
      "edit": "تعديل المنتج"
    },
    "subtitle": {
      "add": "املأ المعلومات لإنشاء منتج جديد",
      "edit": "قم بتحديث معلومات المنتج"
    },
    "labels": {
      "name": "اسم المنتج",
      "brand": "العلامة التجارية",
      "description": "وصف المنتج",
      "categories": "الفئات",
      "variants": "خيارات المنتج (Variants)",
      "color": "اللون",
      "costPrice": "سعر التكلفة (ر.س)",
      "quantity": "الكمية",
      "images": "صور الخيار"
    },
    "placeholders": {
      "name": "مثال: فستان سهرة أنيق",
      "brand": "مثال: Linora Style",
      "description": "أدخل وصفًا تفصيليًا للمنتج...",
      "categorySearch": "ابحث عن فئة...",
      "color": "أحمر",
      "costPrice": "150.00",
      "quantity": "100"
    },
    "buttons": {
      "addVariant": "إضافة خيار جديد",
      "uploadImage": "رفع صورة",
      "submitAdd": "إنشاء المنتج",
      "submitEdit": "حفظ التغييرات",
      "saving": "جاري الحفظ...",
      "loadingCategories": "جاري تحميل الفئات..."
    },
    "category": {
      "noResults": "لا توجد نتائج.",
      "placeholder": "اختر الفئات التي ينتمي إليها المنتج..."
    },
    "variants": {
      "minOne": "ℹ️ يجب أن يحتوي المنتج على خيار واحد على الأقل."
    },
    "toasts": {
      "imageUploadSuccess": "✨ تم رفع الصورة بنجاح.",
      "imageUploadError": "❌ فشل في رفع الصورة.",
      "saveSuccess": {
        "add": "✨ تم إنشاء المنتج بنجاح!",
        "edit": "✨ تم تحديث المنتج بنجاح!"
      },
      "saveError": "❌ فشل الحفظ: {{message}}",
      "categoriesError": "❌ فشل في تحميل قائمة الفئات."
    }
  },
  "EditReelForm": {
    "preview": {
      "title": "معاينة الريل",
      "alt": "صورة مصغرة للريل",
      "views": "{{count}} مشاهدة{{count, plural, zero {} one {} two {} few {} many {} other {ات}}}",
      "noCaption": "لا يوجد وصف بعد..."
    },
    "caption": {
      "label": "الوصف",
      "placeholder": "شارك قصتك، أو صف أسلوبك، أو أضف وصفًا جذابًا...",
      "chars": "{{current}}/{{max}} حرف"
    },
    "taggedProducts": {
      "title": "المنتجات المُوسومة",
      "count": "{{count}}",
      "tagProducts": "وسّم منتجات",
      "manageProducts": "إدارة المنتجات المُوسومة",
      "activeAgreements": "الاتفاقيات النشطة",
      "fromMerchant": "من: {{store}}",
      "allProducts": "جميع المنتجات"
    },
    "validation": {
      "maxCaption": "يجب أن يكون الوصف 1000 حرف كحد أقصى"
    },
    "actions": {
      "saving": "جارٍ الحفظ...",
      "saveChanges": "حفظ التغييرات"
    },
    "toast": {
      "fetchError": "تعذر تحميل المنتجات أو الاتفاقيات.",
      "updateSuccess": "تم تحديث الريل بنجاح!",
      "updateError": "فشل التحديث"
    }
  },
  "ContentManagement": {
    "title": "إدارة محتوى المنصة",
    "subtitle": "قم بتعديل وإدارة المحتوى الظاهر للمستخدمين بطابع أنثوي أنيق",
    "loading": "جاري تحميل المحتوى...",
    "export": "تصدير البيانات",
    "search": {
      "placeholder": "ابحث باسم القسم أو المفتاح..."
    },
    "stats": {
      "total": "إجمالي الأقسام",
      "visible": "أقسام ظاهرة",
      "hidden": "أقسام مخفية"
    },
    "sections": {
      "about": "من نحن",
      "terms": "الشروط",
      "privacy": "الخصوصية",
      "help": "المساعدة",
      "contact": "اتصل بنا"
    },
    "sidebar": {
      "title": "أقسام المحتوى",
      "description": "إدارة جميع أقسام المحتوى على المنصة ({{count}} قسم)",
      "empty": {
        "title": "لا توجد أقسام",
        "filtered": "لم نعثر على أقسام تطابق معايير البحث",
        "noData": "لا توجد أقسام محتوى حالياً"
      }
    },
    "editor": {
      "title": "تعديل المحتوى",
      "empty": {
        "title": "اختر قسم للمعالجة",
        "description": "اختر عنصرًا من القائمة الجانبية لبدء تعديل المحتوى وإدارته"
      },
      "fields": {
        "title": "العنوان",
        "titlePlaceholder": "أدخل العنوان هنا...",
        "content": "المحتوى",
        "contentPlaceholder": "اكتب محتوى القسم هنا...",
        "htmlNote": "يمكنك استخدام تنسيق HTML للمحتوى المتقدم",
        "visibility": {
          "label": "إظهار المحتوى للمستخدمين",
          "visible": "المحتوى ظاهر للجميع",
          "hidden": "المحتوى مخفي حالياً"
        }
      }
    },
    "actions": {
      "save": "حفظ التغييرات",
      "saving": "جاري الحفظ..."
    },
    "toast": {
      "fetchListError": "❌ فشل جلب قائمة المحتوى",
      "fetchDetailsError": "❌ فشل جلب تفاصيل المحتوى",
      "updateSuccess": "✨ تم تحديث المحتوى بنجاح",
      "updateError": "❌ حدث خطأ أثناء التحديث",
      "exportPreparing": "📥 جاري تحضير بيانات التصدير..."
    }
  },
  "suppliernav": {
    "nav": {
      "Overview": "نظرة عامة",
      "Products": "المنتجات",
      "Orders": "الطلبات",
      "Shipping": "الشحن",
      "Wallet": "المحفظة",
      "Settings": "الإعدادات"
    }
  },
  "modelprofile": {
    "pageTitle": "تعديل الملف الشخصي",
    "pageSubtitle": "اجعلي ملفك الشخصي جذابًا للتجار بملء جميع المعلومات وإبراز موهبتك",

    "basicInfo": {
      "title": "المعلومات الأساسية",
      "fullName": "الاسم الكامل",
      "fullNamePlaceholder": "أدخل اسمك الكامل",
      "bio": "نبذة تعريفية",
      "bioPlaceholder": "اكتبي نبذة عنك، خبراتك، وأنواع المنتجات التي تفضلينها...",
      "profilePicture": "الصورة الشخصية",
      "profilePictureTip": "صورة شخصية واضحة تزيد من فرصك"
    },

    "portfolio": {
      "title": "معرض الأعمال",
      "description": "أضيفي أفضل صورك لجذب انتباه التجار. (10 صور كحد أقصى)",
      "addImage": "إضافة صورة",
      "uploadPrompt": "اضغطي للرفع",
      "uploading": "جاري الرفع...",
      "removeImage": "حذف الصورة"
    },

    "stats": {
      "title": "الإحصائيات",
      "followers": "عدد المتابعين",
      "followersPlaceholder": "مثال: 150K",
      "engagement": "نسبة التفاعل",
      "engagementPlaceholder": "مثال: 2.5%"
    },

    "social": {
      "title": "روابط التواصل",
      "instagram": "Instagram",
      "tiktok": "TikTok",
      "twitter": "Twitter (X)",
      "snapchat": "Snapchat",
      "facebook": "Facebook",
      "whatsapp": "WhatsApp",
      "whatsappPlaceholder": "رقم هاتف مع رمز الدولة, e.g., +9665...",
      "instagramPlaceholder": "https://instagram.com/username",
      "tiktokPlaceholder": "https://tiktok.com/@username",
      "twitterPlaceholder": "https://x.com/username",
      "snapchatPlaceholder": "https://snapchat.com/add/username",
      "facebookPlaceholder": "https://facebook.com/username"
    },

    "actions": {
      "saveChanges": "حفظ التغييرات",
      "saving": "جاري الحفظ..."
    },

    "toasts": {
      "loading": "جاري تحميل الملف الشخصي...",
      "saveSuccess": "✨ تم حفظ التغييرات بنجاح!",
      "saveError": "❌ فشل حفظ التغييرات. الرجاء المحاولة مرة أخرى.",
      "profilePicSuccess": "✨ تم تحديث الصورة الشخصية بنجاح.",
      "portfolioAddSuccess": "🎨 تمت إضافة الصورة إلى معرض الأعمال.",
      "portfolioRemove": "🗑️ تم حذف الصورة من المعرض.",
      "uploadError": "❌ فشل رفع الصورة. الرجاء المحاولة مرة أخرى."
    }
  },
  "AdminSubscriptionPlans": {
    "title": "إدارة خطط الاشتراك",
    "subtitle": "قم بإدارة وتخصيص خطط الاشتراك للتجار والعارضين والمؤثرين",
    "stats": {
      "totalPlans": "إجمالي الخطط",
      "activePlans": "خطط نشطة",
      "merchantPlans": "خطط تجار",
      "modelPlans": "خطط عارضات",
      "influencerPlans": "خطط مؤثرين",
      "totalValue": "إجمالي القيمة"
    },
    "searchPlaceholder": "ابحث باسم الخطة أو الدور أو الوصف...",
    "actions": {
      "export": "تصدير البيانات",
      "refresh": "تحديث",
      "newPlan": "خطة جديدة",
      "saveChanges": "حفظ التغييرات",
      "createPlan": "إنشاء الخطة"
    },
    "common": {
      "plans": "خطة واحدة",
      "plans_plural": "{{count}} خطة"
    },
    "plans": {
      "title": "خطط الاشتراك",
      "description": "إدارة جميع خطط الاشتراك المتاحة على المنصة (خطة واحدة)",
      "description_plural": "إدارة جميع خطط الاشتراك المتاحة على المنصة ({{count}} خطة)",
      "loading": "جاري تحميل خطط الاشتراك...",
      "noPlans": "لا توجد خطط",
      "noResults": "لم نعثر على خطط تطابق معايير البحث",
      "empty": "لا توجد خطط اشتراك حالياً"
    },
    "table": {
      "planName": "اسم الخطة",
      "role": "الدور",
      "price": "السعر",
      "features": "الميزات",
      "status": "الحالة",
      "actions": "الإجراءات",
      "moreFeatures": "+{{count}} أكثر"
    },
    "roles": {
      "merchant": "تاجر",
      "model": "عارضة",
      "influencer": "مؤثر"
    },
    "status": {
      "active": "نشط",
      "inactive": "غير نشط"
    },
    "form": {
      "planName": "اسم الخطة",
      "planNamePlaceholder": "مثال: الباقة الاحترافية",
      "role": "الدور",
      "rolePlaceholder": "اختر الدور",
      "price": "السعر (ر.س)",
      "pricePlaceholder": "0.00",
      "description": "الوصف",
      "descriptionPlaceholder": "وصف اختياري للخطة...",
      "features": "الميزات",
      "featuresPlaceholder": "ميزة 1, ميزة 2, ...",
      "featuresHint": "افصل بين الميزات بفاصلة.",
      "includesDropshipping": "يتضمن دروب شيبنج",
      "isActive": "الخطة نشطة"
    },
    "dialog": {
      "editTitle": "تعديل الخطة",
      "createTitle": "إنشاء خطة جديدة"
    },
    "toast": {
      "fetchError": "❌ فشل في جلب خطط الاشتراك.",
      "nameTooShort": "❌ الاسم يجب أن يكون 3 أحرف على الأقل.",
      "invalidPrice": "❌ السعر يجب أن يكون رقم صحيح موجب.",
      "updating": "🔄 جاري تحديث الخطة...",
      "creating": "🔄 جاري إنشاء الخطة...",
      "updateSuccess": "✅ تم تحديث الخطة بنجاح!",
      "createSuccess": "✅ تم إنشاء الخطة بنجاح!",
      "saveError": "❌ حدث خطأ أثناء حفظ الخطة.",
      "exportPreparing": "📥 جاري تحضير بيانات التصدير..."
    }
  },
  "OffersPage": {
    "title": "باقات خدماتي",
    "subtitle": "صممي باقات خدمات احترافية تجذب أفضل التجار وتعكس موهبتك الفريدة",
    "loading": "جاري تحميل الباقات...",
    "stats": {
      "count": "{{count}} باقة خدمة"
    },
    "actions": {
      "create": "إنشاء باقة جديدة",
      "activate": "تفعيل الباقة",
      "deactivate": "إيقاف الباقة"
    },
    "empty": {
      "title": "ليس لديك أي باقات بعد",
      "description": "ابدئي رحلتك مع التجار عبر إنشاء أول باقة خدمات تعبر عن موهبتك",
      "cta": "بدء رحلتي"
    },
    "status": {
      "active": "نشطة",
      "paused": "متوقفة",
      "activeBadge": "🟢 نشطة",
      "pausedBadge": "🟡 متوقفة"
    },
    "tier": {
      "delivery": "تسليم خلال {{days}} أيام",
      "unlimitedRevisions": "مراجعات غير محدودة",
      "revisions": "{{count}} مراجعات"
    },
    "dialog": {
      "create": {
        "title": "إنشاء باقة خدمة جديدة"
      },
      "edit": {
        "title": "تعديل باقة الخدمة"
      },
      "delete": {
        "title": "هل أنت متأكدة؟",
        "description": "سيتم حذف \"{{title}}\" بشكل نهائي.",
        "confirm": "نعم، احذف الباقة"
      }
    },
    "toast": {
      "fetchError": "❌ فشل في جلب باقات الخدمات.",
      "saveSuccess": "✨ تم حفظ الباقة بنجاح!",
      "deleting": "🔄 جاري حذف الباقة...",
      "deleteSuccess": "🗑️ تم حذف الباقة بنجاح!",
      "deleteError": "❌ فشل حذف الباقة.",
      "updatingStatus": "🔄 جاري تحديث الحالة...",
      "updateStatusSuccess": "✨ تم {{action}} الباقة بنجاح!",
      "updateStatusError": "❌ فشل تحديث الحالة."
    }
  },
  "verification":{
    "pageTitle": "تحقق من حسابك",
    "pageSubtitle": "أكمل عملية التحقق للوصول إلى جميع الميزات",
    "personalInfo": "المعلومات الشخصية",
    "idNumber": "رقم الهوية / الإقامة",
    "idPlaceholder": "أدخل رقم الهوية أو الإقامة",
    "idImage": "صورة الهوية / الإقامة",
    "socialMedia": "حسابات التواصل الاجتماعي",
    "followers": "عدد المتابعين",
    "followersPlaceholder": "مثال: 10k أو 150000",
    "addedPlatforms": "المنصات المضافة",
    "submitButton": "تقديم طلب التحقق",
    "submitting": "جارٍ التقديم...",
    "errorAllFields": "يرجى ملء جميع الحقول المطلوبة.",
    "errorDefault": "حدث خطأ أثناء تقديم طلبك.",
    "errorTitle": "فشل التقديم",
    "successTitle": "تم التقديم!",
    "successMessage": "تم استلام طلب التحقق الخاص بك.",
    "verifiedTitle": "تم التحقق من الحساب",
    "verifiedSubtitle": "حسابك مفعل وجاهز للاستخدام",
    "accountActive": "حالة الحساب: مفعل",
    "pendingTitle": "قيد المراجعة",
    "pendingSubtitle": "نقوم بمراجعة مستنداتك. سيتم إعلامك قريبًا.",
    "reviewPending": "قيد المراجعة"
  },
  "ModelDashboard": {
    "loading": "جاري تحميل لوحة التحكم...",
    "unauthorized": {
      "title": "غير مصرح بالوصول",
      "description": "يرجى تسجيل الدخول للوصول إلى لوحة التحكم"
    },
    "welcome": "أهلاً بكِ، {{name}}!",
    "subtitle": "هنا ملخص أدائك وطلبات التعاون ونظرة شاملة على نشاطك في المنصة",
    "stats": {
      "totalEarnings": "إجمالي الأرباح",
      "totalEarningsDesc": "جميع أرباحك حتى الآن",
      "monthlyEarnings": "أرباح هذا الشهر",
      "monthlyEarningsDesc": "مقارنة بالشهر الماضي",
      "completedAgreements": "التعاونات المكتملة",
      "completedAgreementsDesc": "صفقات ناجحة",
      "pendingRequests": "الطلبات الجديدة",
      "pendingRequestsDesc": "بانتظار المراجعة"
    },
    "secondaryStats": {
      "profileViews": "مشاهدة للملف",
      "responseRate": "معدل الرد",
      "upcomingCollaborations": "تعاون قادم",
      "rating": "تقييم العملاء"
    },
    "quickActions": {
      "title": "إجراءات سريعة",
      "description": "إدارة حسابك وأنشطتك بسرعة وسهولة",
      "requests": "طلبات التعاون",
      "offers": "باقات الخدمات",
      "analytics": "التحليلات",
      "wallet": "المحفظة"
    },
    "recentActivity": {
      "title": "النشاط الحديث",
      "description": "آخر التحديثات والأنشطة على حسابك",
      "empty": "لا يوجد نشاط حديث"
    },
    "performance": {
      "title": "نظرة على الأداء",
      "description": "تتبع تقدمك وأدائك هذا الشهر",
      "completionRate": "معدل إكمال المهام",
      "customerSatisfaction": "رضا العملاء",
      "deliverySpeed": "سرعة التسليم",
      "encouragement": {
        "title": "أنتِ على الطريق الصحيح! 🎯",
        "description": "أداؤك أفضل من 80% من العارضات في المنصة"
      }
    },
    "cta": {
      "title": "🚀 مستعدة للبدء؟",
      "description": "قومي بتحسين ملفك الشخصي وجذبي المزيد من الفرص",
      "profile": "تحسين الملف الشخصي",
      "createOffers": "إنشاء باقات جديدة"
    },
    "toast": {
      "fetchError": "❌ فشل في تحميل بيانات لوحة التحكم.",
      "agreementAccepted": "✨ شكرًا لموافقتك على الاتفاقية",
      "agreementError": "❌ حدث خطأ ما، يرجى المحاولة مرة أخرى"
    }
  },
  "AdminSettings": {
    "title": "إعدادات المنصة",
    "subtitle": "قم بإدارة وتخصيص إعدادات منصتك بكل سهولة وأمان",
    "loading": "جاري تحميل الإعدادات...",
    "sections": "الأقسام",
    "nav": {
      "financial": "الإعدادات المالية",
      "payments": "بوابات الدفع",
      "apis": "مفاتيح API",
      "general": "الإعدادات العامة"
    },
    "financial": {
      "title": "الإعدادات المالية",
      "description": "إدارة العمولات والرسوم والإعدادات المالية للمنصة",
      "commissionRate": {
        "label": "عمولة المبيعات (%)",
        "description": "النسبة المئوية التي تحصل عليها المنصة من كل عملية بيع"
      },
      "shippingCommission": {
        "label": "عمولة الشحن (%)",
        "description": "النسبة المئوية التي تحصل عليها المنصة من كل عملية شحن"
      },
      "agreementCommission": {
        "label": "عمولة اتفاقات المودلز (%)",
        "description": "النسبة التي تحصل عليها المنصة من كل اتفاق مكتمل بين تاجر ومودل"
      },
      "dropshippingPrice": {
        "label": "سعر الدروب شيبنج (ر.س)",
        "description": "السعر الثابت للخدمة الأساسية للدروب شيبنج"
      },
      "payoutClearingDays": {
        "label": "فترة تصفية الأرباح (أيام)",
        "description": "عدد الأيام التي تبقى فيها الأرباح معلقة قبل أن تصبح قابلة للسحب",
        "unit": "يوم"
      }
    },
    "payments": {
      "title": "بوابات الدفع",
      "description": "إعدادات بوابة الدفع Stripe للمعاملات الآمنة",
      "stripePublishable": {
        "label": "مفتاح Stripe العلني",
        "description": "المفتاح المستخدم في الواجهة الأمامية للمعاملات الآمنة"
      },
      "stripeSecret": {
        "label": "مفتاح Stripe السري",
        "description": "المفتاح السري المستخدم في الخلفية للمعاملات الآمنة"
      }
    },
    "apis": {
      "title": "مفاتيح API",
      "description": "إدارة مفاتيح وخدمات الطرف الثالث المتكاملة مع المنصة",
      "resend": {
        "label": "مفتاح Resend API",
        "description": "المفتاح المستخدم لإرسال البريد الإلكتروني عبر خدمة Resend"
      },
      "cloudinary": {
        "label": "إعدادات Cloudinary",
        "description": "إعدادات خدمة تخزين ومعالجة الصور والفيديوهات",
        "cloudNamePlaceholder": "اسم السحابة",
        "apiKeyPlaceholder": "مفتاح API",
        "apiSecretPlaceholder": "الرمز السري"
      }
    },
    "general": {
      "title": "الإعدادات العامة",
      "description": "الإعدادات الأساسية والمظهر العام للمنصة",
      "platformName": {
        "label": "اسم المنصة",
        "description": "الاسم الذي سيظهر للمستخدمين في جميع أنحاء المنصة"
      },
      "platformDescription": {
        "label": "وصف المنصة",
        "description": "وصف مختصر يوضح هدف وطبيعة المنصة"
      },
      "maintenanceMode": {
        "label": "وضع الصيانة",
        "description": "تفعيل وضع الصيانة لإيقاف المنصة مؤقتاً للصيانة",
        "activeBadge": "المنصة متوقفة للصيانة"
      }
    },
    "actions": {
      "save": "حفظ الإعدادات",
      "saving": "جاري الحفظ..."
    },
    "toast": {
      "fetchError": "❌ فشل في جلب الإعدادات",
      "saveSuccess": "✨ تم حفظ الإعدادات بنجاح",
      "saveError": "❌ فشل في حفظ الإعدادات"
    }
  },
  "OrderDetails": {
    "loading": "جاري تحميل تفاصيل الطلب...",
    "notFound": {
      "title": "لم يتم العثور على الطلب",
      "description": "الطلب المطلوب غير موجود أو لا يمكن الوصول إليه"
    },
    "backToOrders": "العودة للطلبات",
    "title": "تفاصيل الطلب #{{id}}",
    "subtitle": "عرض وإدارة كافة تفاصيل الطلب وتحديث حالته",
    "toast": {
      "fetchError": "❌ فشل في جلب تفاصيل الطلب.",
      "noChange": "لم يتم تغيير حالة الطلب.",
      "updateSuccess": "✨ تم تحديث حالة الطلب بنجاح!",
      "updateError": "❌ فشل تحديث حالة الطلب."
    },
    "statusCard": {
      "title": "حالة الطلب",
      "description": "تتبع وتحديث حالة الطلب الحالية",
      "current": "الحالة الحالية",
      "placeholder": "اختر حالة جديدة",
      "updating": "جاري التحديث...",
      "update": "تحديث الحالة"
    },
    "productsCard": {
      "title": "المنتجات المطلوبة",
      "description": "قائمة كافة المنتجات في هذا الطلب",
      "quantity": "{{count}} منتج",
      "quantity_plural": "{{count}} منتجات",
      "unitPrice": "سعر الوحدة: {{price}}"
    },
    "customerCard": {
      "title": "معلومات العميل",
      "name": "اسم العميل",
      "email": "البريد الإلكتروني",
      "phone": "رقم الهاتف"
    },
    "summaryCard": {
      "title": "ملخص الطلب",
      "orderDate": "تاريخ الطلب",
      "totalItems": "منتج واحد",
      "totalItems_plural": "{{count}} منتج",
      "items": "إجمالي المنتجات",
      "totalAmount": "المبلغ الإجمالي"
    },
    "shippingCard": {
      "title": "عنوان الشحن",
      "address": "عنوان التوصيل"
    },
    "status": {
      "pending": "قيد الانتظار",
      "processing": "قيد التنفيذ",
      "shipped": "تم الشحن",
      "completed": "مكتمل",
      "cancelled": "ملغي"
    }
  },
  "checkout": {
    "title": "إتمام الطلب",
    "subtitle": "راجع طلبك وأكمل عملية الشراء",
    "orderSummary": "ملخص الطلب",
    "paymentMethod": "طريقة الدفع",
    "creditCard": "بطاقة ائتمان/خصم",
    "cod": "الدفع عند الاستلام",
    "securePayment": "دفع آمن",
    "payOnDelivery": "ادفع عند وصول طلبك",
    "paymentSummary": "ملخص الدفع",
    "subtotal": "المجموع الفرعي",
    "shipping": "الشحن",
    "free": "مجاناً",
    "tax": "الضريبة",
    "included": "مشمولة",
    "total": "الإجمالي",
    "secure": "آمن",
    "encrypted": "مشفر",
    "proceedToPayment": "المتابعة للدفع",
    "placeOrder": "تقديم الطلب",
    "poweredByStripe": "مدعوم من Stripe",
    "cashOnDelivery": "الدفع نقداً عند الاستلام",
    "freeShipping": "شحن مجاني",
    "secureCheckout": "دفع آمن",
    "shippingMethod": "شركه الشحن",
    "selectShippingMethod":"اختر شركه للشحن",
    "guarantee": "ضمان استرداد الأموال",
    "processing": "قيد المعالجة...",
    "paymentFailed": "فشل الدفع. يرجى المحاولة مرة أخرى.",
    "shippingAddress": "عنوان الشحن",
    "selectShippingAddress": "اختر أو أضف عنوان شحن",
    "addNewAddress": "إضافة عنوان جديد",
    "selectAddressError": "لم يتم اختيار عنوان شحن",
    "selectAddressErrorDesc": "يرجى اختيار أو إضافة عنوان شحن للمتابعة."
  },
  "errors": {
    "fetchAddressesFailed": "فشل تحميل العناوين"
  },
  "supplierproducts": {
    "pageTitle": "إدارة المنتجات",
    "pageSubtitle": "أضف وعدّل منتجات الدروبشيبينغ الخاصة بك",

    "stats": {
      "totalProducts": "إجمالي المنتجات",
      "totalVariants": "إجمالي الخيارات",
      "lowStock": "خيارات مخزونها منخفض"
    },

    "actions": {
      "searchPlaceholder": "ابحث عن منتج...",
      "filter": "تصفية",
      "addProduct": "إضافة منتج جديد",
      "addFirstProduct": "إضافة أول منتج"
    },

    "table": {
      "headers": {
        "color": "اللون",
        "costPrice": "سعر التكلفة",
        "quantity": "الكمية",
        "images": "الصور"
      },
      "loading": "جاري تحميل المنتجات...",
      "empty": {
        "title": "لم تقم بإضافة أي منتجات بعد",
        "description": "ابدأ بإضافة منتجك الأول لعرضه للتجار"
      },
      "found": "تم العثور على {{count}} منتج"
    },

    "stock": {
      "outOfStock": "نفذ المخزون",
      "lowStock": "مخزون منخفض",
      "available": "متوفر"
    },

    "dialogs": {
      "addTitle": "إضافة منتج جديد",
      "editTitle": "تعديل المنتج",
      "delete": {
        "title": "هل أنت متأكد؟",
        "description": "سيتم حذف المنتج '{{name}}' بشكل نهائي.",
        "warning": "لا يمكن التراجع عن هذا الإجراء.",
        "cancel": "إلغاء",
        "confirm": "نعم، احذف المنتج"
      }
    },

    "toasts": {
      "saveSuccess": "✨ تم حفظ المنتج بنجاح!",
      "deleteSuccess": "🗑️ تم حذف المنتج بنجاح.",
      "fetchError": "❌ فشل في جلب المنتجات.",
      "deleteError": "❌ فشل حذف المنتج."
    },

    "badges": {
      "productCount": "{{count}} منتج"
    }
  },
  "VerificationsPage": {
    "title": "طلبات توثيق التجار",
    "description": "راجع طلبات التجار الجدد وقم بالموافقة عليها أو رفضها",
    "actions": {
      "refresh": "تحديث",
      "export": "تصدير",
      "review": "مراجعة",
      "quickApprove": "الموافقة السريعة",
      "quickReject": "رفض سريع",
      "viewDetails": "عرض التفاصيل",
      "downloadDocs": "تحميل المستندات",
      "resetFilters": "إعادة تعيين الفلتر"
    },
    "search": {
      "placeholder": "ابحث بالاسم أو البريد الإلكتروني..."
    },
    "filters": {
      "all": "الكل"
    },
    "status": {
      "pending": "قيد الانتظار",
      "approved": "تم الموافقة",
      "rejected": "مرفوض"
    },
    "stats": {
      "total": "إجمالي الطلبات",
      "pending": "قيد المراجعة",
      "approved": "تم الموافقة",
      "rejected": "مرفوض"
    },
    "table": {
      "title": "قائمة طلبات التوثيق",
      "subtitle": "{{filtered}} طلب من أصل {{total}}",
      "merchant": "التاجر",
      "business": "المؤسسة",
      "type": "النوع",
      "status": "الحالة",
      "date": "تاريخ الطلب",
      "actions": "الإجراءات",
      "individual": "شخصي",
      "noResults": "لا توجد نتائج مطابقة للبحث",
      "empty": "لا توجد طلبات توثيق حالياً"
    },
    "type": {
      "business": "مؤسسة",
      "individual": "فرد"
    }
  },
  "ShippingPage": {
    "title": "إدارة شركات الشحن",
    "subtitle": "قم بإدارة شركات الشحن الخاصة بمتجرك وتكاليف الشحن وأوقات التوصيل",
    "stats": {
      "total": "إجمالي الشركات",
      "active": "شركات نشطة",
      "averageCost": "متوسط التكلفة",
      "totalCost": "إجمالي التكاليف"
    },
    "search": {
      "placeholder": "ابحث باسم الشركة أو وقت التوصيل..."
    },
    "actions": {
      "export": "تصدير البيانات",
      "refresh": "تحديث",
      "addCompany": "إضافة شركة"
    },
    "dialog": {
      "createTitle": "إضافة شركة شحن جديدة",
      "editTitle": "تعديل شركة الشحن"
    },
    "form": {
      "name": {
        "label": "اسم شركة الشحن",
        "placeholder": "أدخل اسم شركة الشحن"
      },
      "cost": {
        "label": "تكلفة الشحن (ر.س)"
      },
      "deliveryTime": {
        "label": "وقت التوصيل",
        "placeholder": "مثال: 3-5 أيام عمل"
      }
    },
    "table": {
      "title": "شركات الشحن",
      "subtitle": "إدارة جميع شركات الشحن المتاحة ({{count}} شركة)",
      "companies": "شركة",
      "headers": {
        "company": "الشركة",
        "cost": "تكلفة الشحن",
        "deliveryTime": "وقت التوصيل",
        "status": "الحالة",
        "dateAdded": "تاريخ الإضافة",
        "actions": "الإجراءات"
      }
    },
    "status": {
      "active": "نشطة",
      "inactive": "غير نشطة",
      "activated": "تفعيل",
      "deactivated": "تعطيل"
    },
    "empty": {
      "title": "لا توجد شركات شحن",
      "noCompanies": "لم تقم بإضافة أي شركات شحن حتى الآن",
      "noResults": "لم نعثر على شركات تطابق معايير البحث"
    },
    "loading": "جاري تحميل شركات الشحن...",
    "currency": "ر.س",
    "success": {
      "create": "تم إضافة شركة الشحن بنجاح!",
      "update": "تم تحديث شركة الشحن بنجاح!",
      "delete": "تم حذف شركة الشحن بنجاح!",
      "toggleStatus": "تم {{action}} شركة الشحن بنجاح!"
    },
    "errors": {
      "fetchFailed": "فشل في جلب شركات الشحن",
      "saveFailed": "فشل في حفظ البيانات",
      "deleteFailed": "فشل في حذف شركة الشحن",
      "toggleFailed": "فشل في تحديث الحالة",
      "missingFields": "يرجى ملء جميع الحقول المطلوبة"
    },
    "info": {
      "exporting": "جارٍ تحضير بيانات التصدير..."
    },
    "delete": {
      "confirmTitle": "تأكيد الحذف",
      "confirmMessage": "هل أنت متأكد من رغبتك في حذف شركة الشحن \"{{name}}\"؟"
    },
    "defaults": {
      "deliveryTime": "3-5 أيام عمل"
    }
  },
  "ModelProfile": {
    "loading": "جاري تحميل الملف الشخصي...",
    "notFound": {
      "title": "العارضة غير موجودة",
      "description": "قد تكون العارضة غير متاحة حالياً"
    },
    "role": {
      "model": "عارضة أزياء",
      "influencer": "مؤثرة"
    },
    "experience": "{{years}} سنوات خبرة",
    "defaultBio": "عارضة موهوبة مع خبرة واسعة في مجال الأزياء والتسويق.",
    "actions": {
      "startConversation": "بدء المحادثة",
      "creatingChat": "جاري إنشاء المحادثة...",
      "bookCampaign": "حجز حملة"
    },
    "stats": {
      "title": "الإحصائيات",
      "followers": "المتابعين",
      "engagement": "التفاعل",
      "responseTime": "وقت الرد",
      "completionRate": "معدل الإنجاز",
      "completedCampaigns": "الحملات المكتملة"
    },
    "social": {
      "title": "وسائل التواصل"
    },
    "languages": "اللغات",
    "tabs": {
      "portfolio": "المعرض",
      "packages": "الباقات",
      "offers": "العروض"
    },
    "portfolio": {
      "empty": {
        "title": "لا توجد صور في المعرض",
        "description": "لم تقم العارضة بإضافة أي صور إلى معرضها بعد"
      }
    },
    "packages": {
      "empty": {
        "title": "لا توجد باقات متاحة",
        "description": "لم تقم العارضة بإنشاء أي باقات خدمة بعد"
      },
      "delivery": "تسليم خلال {{days}} أيام",
      "unlimitedRevisions": "مراجعات غير محدودة",
      "revisions": "{{count}} مراجعات",
      "select": "اختر الباقة"
    },
    "offers": {
      "empty": {
        "title": "لا توجد عروض متاحة",
        "description": "لم تقم العارضة بإنشاء أي عروض خاصة بعد"
      },
      "request": "طلب العرض"
    },
    "dialog": {
      "offer": {
        "title": "تأكيد طلب العرض",
        "productLabel": "اختر المنتج المراد الترويج له",
        "productPlaceholder": "اختر منتج من قائمتك",
        "confirm": "المتابعة للدفع",
        "processing": "جاري التوجيه للدفع..."
      },
      "package": {
        "title": "تأكيد طلب باقة: {{tier}}",
        "description": "سيتم حجز مبلغ {{amount}}. اختر المنتج للبدء.",
        "productLabel": "اختر المنتج المراد الترويج له",
        "productPlaceholder": "اختر منتج من قائمتك",
        "confirm": "المتابعة للدفع",
        "processing": "جاري التوجيه للدفع..."
      }
    },
    "toast": {
      "fetchError": "❌ فشل في تحميل بيانات العارضة",
      "offerProductRequired": "❌ الرجاء اختيار المنتج أولاً",
      "packageProductRequired": "❌ الرجاء اختيار المنتج أولاً",
      "paymentFailed": "❌ تعذر الوصول لصفحة الدفع",
      "checkoutError": "❌ حدث خطأ أثناء إنشاء الطلب",
      "packageCheckoutError": "❌ حدث خطأ أثناء إنشاء طلب الباقة",
      "conversationError": "❌ فشل في بدء المحادثة",
      "comingSoon": "🚀 ميزة الحجز المباشر قريباً!",
      "linkCopied": "✅ تم نسخ رابط الملف الشخصي"
    }
  },
  "supplierwallet": {
    "pageTitle": "المحفظة المالية",
    "pageSubtitle": "إدارة أرباحك وطلبات السحب",

    "stats": {
      "availableBalance": "الرصيد المتاح للسحب",
      "pendingEarnings": "أرباح قيد التعليق"
    },

    "payoutHistory": {
      "title": "سجل طلبات السحب",
      "headers": {
        "amount": "المبلغ",
        "date": "التاريخ",
        "status": "الحالة",
        "notes": "ملاحظات الإدارة"
      },
      "empty": {
        "title": "لا توجد طلبات سحب سابقة",
        "description": "يمكنك تقديم أول طلب سحب لك"
      }
    },

    "payoutForm": {
      "title": "طلب سحب جديد",
      "label": "المبلغ المراد سحبه",
      "placeholder": "0.00",
      "submit": "إرسال الطلب",
      "submitting": "جاري الإرسال...",
      "infoTitle": "معلومة هامة",
      "infoDescription": "سيتم مراجعة طلبك وتحويل المبلغ إلى حسابك البنكي المسجل خلال 3-5 أيام عمل."
    },

    "status": {
      "pending": "قيد المراجعة",
      "approved": "مقبول",
      "rejected": "مرفوض"
    },

    "toasts": {
      "fetchError": "❌ فشل في جلب بيانات المحفظة.",
      "invalidAmount": "❌ يجب أن يكون المبلغ أكبر من صفر.",
      "insufficientBalance": "❌ المبلغ المطلوب يتجاوز رصيدك المتاح.",
      "submitSuccess": "✨ تم إرسال طلب السحب بنجاح!",
      "submitError": "❌ فشل في إرسال الطلب."
    },

    "currency": "ر.س"
  },
  "PayoutsPage": {
    "title": "طلبات السحب المعلقة",
    "exportData" :"تصدير البيانات",
    "table": {
      "requestId": "رقم الطلب",
      "merchant": "التاجر",
      "amount": "المبلغ",
      "date": "تاريخ الطلب",
      "empty": "لا توجد طلبات سحب معلقة حاليًا."
    },
    "dialog": {
      "title": "تفاصيل طلب السحب #{{id}}",
      "description": "مراجعة تفاصيل التاجر البنكية قبل اتخاذ الإجراء.",
      "merchantInfo": "معلومات التاجر",
      "bankInfo": "المعلومات البنكية",
      "name": "الاسم",
      "type": "النوع",
      "email": "البريد الإلكتروني",
      "phone": "رقم الهاتف",
      "accountNumber": "رقم الحساب",
      "iban": "رقم الآيبان (IBAN)",
      "viewIbanCertificate": "عرض شهادة الآيبان",
      "notAvailable": "غير متوفر"
    },
    "actions": {
      "approve": "موافقة",
      "reject": "رفض"
    },
    "prompt": {
      "rejectionReason": "الرجاء توضيح سبب الرفض (اختياري):"
    },
    "notes": {
      "approved": "تمت الموافقة والدفع",
      "rejectedNoReason": "تم الرفض دون سبب محدد"
    },
    "toast": {
      "fetchError": "فشل في جلب طلبات السحب.",
      "detailsError": "فشل في جلب تفاصيل الطلب.",
      "updateSuccess": "تم تحديث الطلب #{{id}} بنجاح.",
      "updateError": "فشل تحديث الطلب #{{id}}."
    }
  },
  "WalletPage": {
    "title": "المحفظة المالية",
    "description": "إدارة أموالك ومتابعة المعاملات وطلبات السحب",
    "actions": {
      "downloadStatement": "كشف الحساب"
    },
    "tabs": {
      "overview": "نظرة عامة",
      "transactions": "سجل المعاملات"
    },
    "stats": {
      "availableBalance": "الرصيد المتاح",
      "availableBalanceDesc": "المبلغ المتاح للسحب الفوري",
      "pendingEarnings": "الأرباح المعلقة",
      "pendingEarningsDesc": "أرباح من طلبات قيد التوصيل",
      "totalEarnings": "إجمالي الأرباح",
      "totalEarningsDesc": "إجمالي الأرباح منذ البدء",
      "lastPayout": "آخر سحب",
      "lastPayoutDesc": "آخر عملية سحب ناجحة"
    },
    "payout": {
      "title": "طلب سحب جديد",
      "description": "أدخل المبلغ الذي ترغب في سحبه من رصيدك المتاح. سيتم مراجعة الطلب خلال 3 أيام عمل.",
      "minAmountNotice": "الحد الأدنى للسحب هو {{minAmount}} ريال سعودي",
      "amountLabel": "المبلغ المطلوب (ريال سعودي)",
      "amountPlaceholder": "أدخل المبلغ، مثال: 500",
      "confirmButton": "تأكيد السحب",
      "processing": "جارٍ المعالجة...",
      "availableBalance": "المبلغ المتاح",
      "requestedAmount": "المبلغ المطلوب",
      "insufficientBalance": "المبلغ المطلوب يتجاوز الرصيد المتاح"
    },
    "info": {
      "title": "معلومات مهمة",
      "security": {
        "title": "أمان كامل",
        "description": "معاملاتك محمية ومؤمنة"
      },
      "processingTime": {
        "title": "3 أيام عمل",
        "description": "مدة معالجة طلبات السحب"
      },
      "minAmount": {
        "title": "{{minAmount}} ر.س حد أدنى",
        "description": "أقل مبلغ لطلب السحب"
      }
    },
    "transactions": {
      "title": "سجل المعاملات",
      "description": "جميع عمليات السحب والإيداعات في محفظتك",
      "empty": "لا توجد معاملات حتى الآن",
      "emptyDescription": "ستظهر معاملاتك هنا عند إجرائك أول عملية"
    },
    "transactionType": {
      "payout": "سحب",
      "earning": "أرباح",
      "refund": "استرجاع"
    },
    "transactionStatus": {
      "completed": "مكتمل",
      "pending": "قيد المراجعة",
      "failed": "فاشل"
    },
    "toast": {
      "fetchWalletError": {
        "title": "فشل في تحميل بيانات المحفظة",
        "description": "تعذر جلب بيانات المحفظة. يرجى المحاولة مرة أخرى."
      },
      "invalidAmount": {
        "title": "قيمة غير صالحة",
        "description": "يرجى إدخال مبلغ صحيح أكبر من الصفر."
      },
      "insufficientBalance": {
        "title": "رصيد غير كافي",
        "description": "المبلغ المطلوب يتجاوز الرصيد المتاح في محفظتك."
      },
      "minPayout": {
        "title": "حد أدنى للسحب",
        "description": "الحد الأدنى لطلب السحب هو {{minAmount}} ريال سعودي."
      },
      "payoutSuccess": {
        "title": "تم إرسال الطلب بنجاح",
        "description": "سيتم مراجعة طلب السحب خلال 3 أيام عمل."
      },
      "payoutError": {
        "title": "فشل في إرسال الطلب",
        "description": "تعذر إرسال طلب السحب. يرجى المحاولة مرة أخرى."
      }
    }
  },
  "Orders": {
    "title": "إدارة الطلبات",
    "subtitle": "قم بإدارة ومتابعة جميع طلبات العملاء بكل سهولة",
    "searchPlaceholder": "ابحث برقم الطلب أو اسم العميل أو المنتج...",
    "actions": {
      "export": "تصدير البيانات",
      "refresh": "تحديث",
      "newOrder": "طلب جديد"
    },
    "filters": {
      "all": "جميع الحالات",
      "allOrders": "جميع الطلبات"
    },
    "clearFilters": "مسح الفلاتر",
    "loading": "جاري تحميل الطلبات...",
    "noOrders": "لا توجد طلبات",
    "noResults": "لم نعثر على طلبات تطابق معايير البحث",
    "empty": "لا توجد طلبات حالياً",
    "stats": {
      "total": "إجمالي الطلبات",
      "pending": "طلبات معلقة",
      "completed": "طلبات مكتملة",
      "cancelled": "طلبات ملغاة",
      "totalRevenue": "إجمالي الإيرادات"
    },
    "status": {
      "pending": "قيد الانتظار",
      "completed": "مكتمل",
      "cancelled": "ملغى"
    },
    "table": {
      "title": "قائمة الطلبات",
      "description": "طلب واحد",
      "description_plural": "{{count}} طلب",
      "orderId": "رقم الطلب",
      "customer": "اسم العميل",
      "date": "تاريخ الطلب",
      "status": "الحالة",
      "amount": "المبلغ",
      "actions": "الإجراءات"
    },
    "common": {
      "orders": "طلب واحد",
      "orders_plural": "{{count}} طلب"
    },
    "viewDetails": "التفاصيل",
    "toast": {
      "fetchError": "❌ فشل في جلب الطلبات",
      "exportPreparing": "📥 جاري تحضير بيانات التصدير..."
    }
  },
  "CategorySlider": {
    "title": "تسوق حسب الفئة",
    "viewAll":"رؤيه الكل",
  },
  "PromotedProducts": {
    "featured": {
      "title": "المنتجات المميزة",
      "subtitle": "الأكثر طلباً هذا الأسبوع",
      "viewAll": "عرض جميع المنتجات المميزة"
    },
    "discounts": {
      "title": "خصومات كبيرة",
      "subtitle": "وفر حتى 70%",
      "fast": "سريع",
      "save": "وفر {{percent}}%",
      "viewAll": "عرض جميع العروض"
    },
    "mainPromotion": {
      "fallbackTitle": "تخفيضات الصيف الكبرى",
      "fallbackSubtitle": "احصل على أفضل العروض على المنتجات المميزة بخصومات تصل إلى 70%",
      "fallbackButton": "اكتشف العروض",
      "fallbackBadge": "عرض محدود"
    }
  },
  "merchantDashboard": {
    "loading": "جاري تحميل لوحة التحكم...",
    "retry": "إعادة المحاولة",
    "error": {
      "fetchFailed": "فشل في تحميل بيانات لوحة التحكم."
    },
    "agreement": {
      "accepted": "شكرًا لموافقتك على الاتفاقية!",
      "error": "حدث خطأ ما، يرجى المحاولة مرة أخرى"
    },
    "welcome": "أهلاً بك، {{name}}!",
    "welcomeSubtitle": "هنا ملخص أداء متجرك.",
    "stats": {
      "totalSales": "إجمالي المبيعات",
      "averageRating": "التقييم المتوسط",
      "fromReviews": "من {{count}} تقييم",
      "monthlyViews": "الزيارات الشهرية",
      "activeProducts": "المنتجات النشطة",
      "newOrders": "الطلبات الجديدة"
    },
    "chart": {
      "title": "ملخص المبيعات",
      "description": "أداء مبيعاتك خلال الفترة المحددة",
      "thisWeek": "هذا الأسبوع",
      "thisMonth": "هذا الشهر",
      "sales": "المبيعات",
      "date": "{{date}}"
    },
    "orders": {
      "title": "الطلبات الحديثة",
      "recent": "آخر {{count}} طلبات",
      "noRecent": "لا توجد طلبات حديثة",
      "viewAll": "عرض جميع الطلبات",
      "orderNumber": "الطلب #{{id}}",
      "status": {
        "completed": "مكتمل",
        "pending": "قيد الانتظار",
        "cancelled": "ملغى"
      }
    },
    "verification": {
      "pending": {
        "title": "حسابك قيد المراجعة",
        "description": "لقد استلمنا مستنداتك وسنقوم بمراجعتها قريبًا. سيتم إعلامك عبر البريد الإلكتروني."
      },
      "rejected": {
        "title": "هناك مشكلة في توثيق حسابك"
      },
      "notSubmitted": {
        "title": "حسابك في انتظار التوثيق"
      },
      "actionRequired": "يجب عليك توثيق حسابك لتتمكن من إضافة المنتجات والبدء في البيع.",
      "goToVerification": "اضغط هنا للانتقال إلى صفحة التوثيق."
    },
    "onboarding": {
      "title": "مرحباً بك في لينورا!",
      "description": "أكمل عملية توثيق حسابك للوصول إلى لوحة التحكم الكاملة والبدء في رحلتك كتاجر."
    }
  },
  "productDetail": {
    "breadcrumb": {
      "products": "المنتجات"
    },
    "byMerchant": "بواسطة {{merchant}}",
    "selectColor": "اختر اللون",
    "quantity": "الكمية",
    "addToCart": "أضف إلى السلة",
    "inStock": "متوفر ({{count}} قطعة)",
    "outOfStock": "نفذت الكمية",
    "discount": "خصم {{percent}}%",
    "saveAmount": "وفر {{amount}}",
    "features": {
      "fastShipping": "شحن سريع خلال 24-48 ساعة",
      "freeReturn": "إرجاع مجاني خلال 30 يوم",
      "qualityGuarantee": "ضمان الجودة والصلاحية"
    },
    "reviews": {
      "title": "تقييمات العملاء",
      "ratingCount": "تقييم",
      "outOf": "من أصل {{count}} تقييم",
      "noReviews": {
        "title": "لا توجد تقييمات حتى الآن",
        "description": "كن أول من يقيم هذا المنتج!"
      },
      "anonymous": "مستخدم"
    },
    "notFound": {
      "title": "المنتج غير موجود",
      "description": "عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.",
      "browseProducts": "تصفح المنتجات"
    },
    "toast": {
      "fetchError": "❌ فشل في تحميل بيانات المنتج",
      "addToCartSuccess": "🛒 تمت إضافة المنتج إلى السلة!",
      "addToWishlist": "❤️ تمت إضافة المنتج إلى المفضلة",
      "removeFromWishlist": "تمت إزالة المنتج من المفضلة",
      "wishlistError": "❌ حدث خطأ أثناء تحديث المفضلة",
      "unexpectedError": "❌ حدث خطأ غير متوقع",
      "shareSuccess": "تم مشاركة المنتج بنجاح",
      "copyLinkSuccess": "تم نسخ رابط المنتج"
    }
  },
  "footer": {
    "company": {
      "name": "لينيورا",
      "description": "منصة نسائية متكاملة تجمع بين التجارة، الموضة، والإبداع في مكان واحد آمن وموثوق."
    },
    // In en -> translation -> footer
    // In ar -> translation -> footer
    "discoverLinyora": {
      "title": "اكتشف لينورا",
      "newArrivals": "وصل حديثاً",
      "bestSellers": "الأكثر مبيعاً",
      "specialOffers": "عروض خاصة",
      "browseDesigners": "تصفح المصممين"
    },
    "features": {
      "exclusiveFashion": {
        "title": "موضة حصرية",
        "description": "أحدث التصاميم والمنتجات التي تعكس ذوقكِ"
      },
      "safeEnvironment": {
        "title": "بيئة آمنة",
        "description": "نضمن لكِ تجربة تسوق وتعاون موثوقة وآمنة"
      },
      "fastDelivery": {
        "title": "توصيل سريع",
        "description": "توصيل سريع وموثوق لجميع طلباتكِ"
      },
      "womenSupport": {
        "title": "دعم نسائي متكامل",
        "description": "فريق دعم متخصص لمساعدتكِ في كل خطوة"
      }
    },
    "quickLinks": {
      "title": "روابط سريعة",
      "home": "الرئيسية",
      "shop": "المتجر",
      "about": "من نحن",
      "returnPolicy": "سياسة الاستبدال",
      "contact": "اتصلي بنا"
    },
    "platformSections": {
      "title": "أقسام المنصة",
      "becomeMerchant": "كوني تاجرة",
      "becomeModel": "كوني مودل",
      "becomeInfluencer": "كوني مؤثرة",
      "dropshipping": "دروب شوبنق"
    },
    "contact": {
      "title": "تواصلي معنا",
      "address": "الرياض، المملكة العربية السعودية"
    },
    "legal": {
      "privacyPolicy": "سياسة الخصوصية",
      "terms": "الشروط والأحكام"
    },
    "copyright": "منصة لينورا. جميع الحقوق محفوظة."
  },
  
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: false, // من الأفضل إيقافه في الإنتاج
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

// تحديث اتجاه ولغة الصفحة عند التغيير
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir(lng);
  }
});

export default i18n;