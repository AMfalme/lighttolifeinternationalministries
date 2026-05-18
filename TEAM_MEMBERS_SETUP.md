# Leadership Account Setup Guide
## Overview
You now have a complete leadership account management system that allows each of your 3 church branch leaders to have their own account, log in, and manage their profile information.
### 1. **Enhanced User Types** 
- Added `branchLocation` field to track which branch each leadership account is assigned to
- Added `phoneNumber` field for contact information
- Added `role` field to distinguish leadership from regular users
- Added `photoURL` support so each leadership account can have an avatar image
### 2. **Leadership Management Page**
- **Location**: `/admin/team`
- **Access**: Available in the dashboard sidebar under "👥 Leadership"
- **Features**:
  - Create new leadership accounts
  - View all leadership accounts and their details
  - Edit existing leadership information
  - Delete leadership accounts
  - Choose or delete uploaded images from the shared image gallery
- The homepage leadership/teams section now loads from Firestore
- Leadership records stored in the dashboard are shown publicly
- Leadership accounts can now edit their:
## How to Set Up Your 3 Leadership Accounts
### Step 1: Access the Leadership Management Page
1. Log in to your admin account
2. Click on "Dashboard" to go to your profile
3. In the left sidebar, click **"👥 Leadership"**
4. You'll see the Leadership management page (currently empty if no leadership accounts yet)
### Step 2: Add First Leadership Account
1. Click the **"+ Add Leadership"** button (top right)
2. Fill in the following information:
  - **Full Name**: Enter the leadership account holder's name
  - **Email**: Their email address (they'll use this to log in)
  - **Branch Location**: Select from:
    - Mosocho (Main church headquarters)
    - Nyanchwa
    - Omogwa
  - **Phone Number**: Their contact number (optional)
  - **Profile Image**: Pick an uploaded image or paste an image URL
  - **Password**: Create a secure password for their account
3. Click **"Create Account"**
4. You'll see a success message
### Step 3: Repeat for Other 2 Leadership Accounts
### Example Setup
---
## How Leadership Log In and Use Their Accounts
### Logging In
1. Go to your website's **Login** page (`/login`)
2. Enter their email address and password
3. They'll be taken to their dashboard
### Accessing Their Profile
1. Once logged in, they can see their dashboard
2. Click **"👤 Profile"** in the left sidebar
3. They can view and edit:
  - Their full name
  - Their phone number
  - Their assigned branch location
  - Their profile image
4. Click **"Save Changes"** to update their profile
### Other Dashboard Features
Leadership accounts have access to:
- **Profile**: Manage their personal information
- **Manage Blogs**: Create/edit blog posts for their branch
- **Manage Events**: Create/edit events for their branch
- **Manage Projects**: Create/edit projects for their branch
## Managing Leadership
### View All Leadership
Go to **Admin → Leadership** to see a card view of all leadership accounts with:
- Name
- Email
- Assigned Branch
- Phone Number
- Avatar image status
### Edit a Leadership Account's Details
1. Find the leadership account in the list
2. Click the **"Edit"** button on their card
3. Modify their information (you cannot change email)
4. Click **"Update Account"**
### Delete a Leadership Account
1. Find the leadership account in the list
2. Click the **"Delete"** button
3. Confirm the deletion
4. Their account and all associated data will be removed
- Only admins can create leadership accounts (you set their initial password)
- Leadership accounts can change their password through their profile/settings
- Currently, all leadership accounts can see and edit all content. If you want to restrict leadership accounts to only see/edit their own branch's content, let me know and I can add:
- Each leadership account has its own unique login
### Leadership account can't log in
### Can't see Leadership page
- Make sure you're logged in as an admin
- Check that you're at `/admin/team`
- Refresh the page
1. **Password Reset**: Allow leadership accounts to reset their own passwords
2. **Branch-Based Content Filtering**: Restrict leadership accounts to only see/edit their own branch's content
4. **Leadership Reports**: Dashboard showing activity/statistics per branch
5. **Bulk Leadership Import**: Upload CSV file to create multiple accounts at once
6. **Email Notifications**: Auto-send login credentials to new leadership accounts
7. **Activity Logging**: Track changes made by each leadership account
Your Firestore database now stores the following for each leadership account:
├── role: "leadership" (identifies the account as leadership)
Good luck managing your leadership accounts! Contact me if you have any questions or need additional features.
