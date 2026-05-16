# Team Members Account Setup Guide

## Overview
You now have a complete team member account management system that allows each of your 3 church branch leaders to have their own account, log in, and manage their profile information.

## Features Added

### 1. **Enhanced User Types** 
- Added `branchLocation` field to track which branch each team member is assigned to
- Added `phoneNumber` field for contact information
- Added `role` field to distinguish team members from regular users
- Added `photoURL` support so each team member can have an avatar image

### 2. **Team Members Management Page**
- **Location**: `/admin/team`
- **Access**: Available in the dashboard sidebar under "👥 Team Members"
- **Features**:
  - Create new team member accounts
  - View all team members and their details
  - Edit existing team member information
  - Delete team member accounts
  - Choose or delete uploaded images from the shared image gallery

### 3. **Live Public Team Section**
- The homepage leadership/teams section now loads from Firestore
- Team-member records stored in the dashboard are shown publicly
- Avatar, branch, email, and phone information stay in sync automatically

### 4. **Enhanced Profile Page**
- Team members can now edit their:
  - Full Name
  - Phone Number
  - Branch Location
  - Profile Image

---

## How to Set Up Your 3 Team Members

### Step 1: Access the Team Management Page
1. Log in to your admin account
2. Click on "Dashboard" to go to your profile
3. In the left sidebar, click **"👥 Team Members"**
4. You'll see the Team Members management page (currently empty if no team members yet)

### Step 2: Add First Team Member
1. Click the **"+ Add Team Member"** button (top right)
2. Fill in the following information:
   - **Full Name**: Enter the team member's name
   - **Email**: Their email address (they'll use this to log in)
   - **Branch Location**: Select from:
     - Main Branch
     - North Location
     - South Location
   - **Phone Number**: Their contact number (optional)
  - **Profile Image**: Pick an uploaded image or paste an image URL
   - **Password**: Create a secure password for their account

3. Click **"Create Account"**
4. You'll see a success message

### Step 3: Repeat for Other 2 Team Members
- Repeat Step 2 for each of your other 2 team members
- Make sure to assign each to their respective branch location

### Example Setup
```
Team Member 1:
- Name: John Smith
- Email: john@church.com
- Branch: Main Branch
- Phone: (555) 123-4567
- Password: SecurePass123

Team Member 2:
- Name: Sarah Johnson
- Email: sarah@church.com
- Branch: North Location
- Phone: (555) 234-5678
- Password: SecurePass456

Team Member 3:
- Name: Michael Davis
- Email: michael@church.com
- Branch: South Location
- Phone: (555) 345-6789
- Password: SecurePass789
```

---

## How Team Members Log In and Use Their Accounts

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
Team members have access to:
- **Profile**: Manage their personal information
- **Manage Blogs**: Create/edit blog posts for their branch
- **Manage Events**: Create/edit events for their branch
- **Manage Projects**: Create/edit projects for their branch

---

## Managing Team Members

### View All Team Members
Go to **Admin → Team Members** to see a card view of all team members with:
- Name
- Email
- Assigned Branch
- Phone Number
- Avatar image status

### Edit a Team Member's Details
1. Find the team member in the list
2. Click the **"Edit"** button on their card
3. Modify their information (you cannot change email)
4. Click **"Update Account"**

### Delete a Team Member
1. Find the team member in the list
2. Click the **"Delete"** button
3. Confirm the deletion
4. Their account and all associated data will be removed

---

## Important Notes

### Password Management
- Only admins can create team member accounts (you set their initial password)
- Team members can change their password through their profile/settings
- If they forget their password, you'll need to delete and recreate their account (we can add a password reset feature later if needed)

### Firebase Admin Setup
- Creating and deleting accounts now uses a server-side Firebase Admin route
- You need these environment variables set for account creation and deletion to work:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

### Branch Location Filtering
Currently, all team members can see and edit all content. If you want to restrict team members to only see/edit their own branch's content, let me know and I can add:
- Content filtering by branch
- Branch-specific dashboards
- Content visibility controls

### Account Security
- Each team member has their own unique login
- Their data is stored securely in Firebase
- Only authenticated users can access the dashboard

---

## Troubleshooting

### Team member can't log in
- Check that the email and password are correct
- Make sure the account was successfully created
- Clear browser cache and try again

### Can't see Team Members page
- Make sure you're logged in as an admin
- Check that you're at `/admin/team`
- Refresh the page

### Changes not saving
- Check your internet connection
- Make sure all required fields are filled
- Try refreshing the page after saving

---

## Next Steps / Optional Features

If you'd like to enhance this system further, we can add:

1. **Password Reset**: Allow team members to reset their own passwords
2. **Branch-Based Content Filtering**: Restrict team members to only see their branch's content
3. **Role-Based Permissions**: Different permission levels (view-only, editor, admin)
4. **Team Member Reports**: Dashboard showing activity/statistics per branch
5. **Bulk Team Member Import**: Upload CSV file to create multiple accounts at once
6. **Email Notifications**: Auto-send login credentials to new team members
7. **Activity Logging**: Track changes made by each team member

Just let me know what would be most useful!

---

## Database Structure

Your Firestore database now stores the following for each team member:

```
users/
├── [user_id]/
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── phoneNumber: string
│   ├── branchLocation: string (Main Branch, North Location, or South Location)
│   ├── role: "team-member" (identifies them as a team member)
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
```

---

Good luck managing your team members! Contact me if you have any questions or need additional features.
