import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Edit, Ban, Check, ChevronDown, X, Trash2, ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle
} from 'lucide-react';
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const MainDashboard = () => {
  // State Management
  const userEmail = useSelector((state) => state.data?.userData.user.email);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const countryRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  //page management cycle
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAddMode, setIsAddMode] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setAdminEmail(userEmail);
  }, [userEmail])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    country: '',
    role: '',
    status: ''
  });

  // Refs
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Constants
  const roleOptions = ['All Roles', 'Super Admin', 'Admin', 'Reviewer'];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  // Role mapping objects
  const roleApiToDisplay = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'reviewer': 'Reviewer'
  };

  const roleDisplayToApi = {
    'Super Admin': 'super_admin',
    'Admin': 'admin',
    'Reviewer': 'reviewer'
  };

  const countryOptions = [
    { label: "United States", value: "US", flag: "🇺🇸" },
    { label: "India", value: "India", flag: "🇮🇳" },
  ];
  const selectedCountryLabel =
    countryOptions.find((opt) => opt.value === formData?.country)?.label || "Select your country";

  // US Phone Number Formatting Function
  function formatUSPhoneNumber(value) {
    if (!value) return '';

    let cleaned = value.trim();
    // Remove "+1" if present at the start
    if (cleaned.startsWith('+1')) {
      cleaned = cleaned.slice(2).trim();
    }
    // Remove all non-numeric characters
    let x = cleaned.replace(/[^\d]/g, '');
    // Only use first 10 digits
    x = x.substring(0, 10);

    if (!x) return '';
    if (x.length < 4) {
      return '(' + x;
    } else if (x.length < 7) {
      return `(${x.slice(0, 3)}) ${x.slice(3)}`;
    } else {
      return `+1 (${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
    }
  }
  // Format phone number based on country
  function formatPhoneNumber(value, country) {
    if (!value) return value;

    if (country === "US" || country === "USA") {
      let cleaned = value.trim();
      // Remove "+1" if present at the start
      if (cleaned.startsWith('+1')) {
        cleaned = cleaned.slice(2).trim();
      }
      // Remove all non-numeric characters
      let x = cleaned.replace(/[^\d]/g, '');
      // Only use first 10 digits
      x = x.substring(0, 10);

      if (!x) return '';
      if (x.length < 4) {
        return '(' + x;
      } else if (x.length < 7) {
        return `(${x.slice(0, 3)}) ${x.slice(3)}`;
      } else {
        return `+1 (${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
      }

    } else if (country === "India" || country === "india") {
      let cleaned = value.trim();
      // Remove "+91" if present at the start
      if (cleaned.startsWith('+91')) {
        cleaned = cleaned.slice(3).trim();
      }
      // Remove all non-numeric characters
      let x = cleaned.replace(/[^\d]/g, '');
      // Only use first 10 digits
      x = x.substring(0, 10);

      if (!x) return '';
      if (x.length <= 5) {
        return `+91 ${x}`;
      }
      return `+91 ${x.slice(0, 5)} ${x.slice(5)}`;
    }

    return value;
  }

  function extractPhoneDigits(formattedPhone, country) {
    if (!formattedPhone) return '';

    // Remove all non-numeric characters
    let cleaned = formattedPhone.replace(/\D/g, '');

    if (country.toLowerCase() === 'us' || country.toLowerCase() === 'usa') {
      // Remove leading '1' (country code) if present and length is 11
      if (cleaned.startsWith('1') && cleaned.length === 11) {
        cleaned = cleaned.slice(1);
      }
      // Ensure 10 digits max
      cleaned = cleaned.substring(0, 10);
    } else if (country.toLowerCase() === 'india' || country.toLowerCase() === 'in') {
      // Remove leading '91' (country code) if present and length is 12
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = cleaned.slice(2);
      }
      // Ensure 10 digits max
      cleaned = cleaned.substring(0, 10);
    } else {
      // Default: first 10 digits
      cleaned = cleaned.substring(0, 10);
    }

    return cleaned;
  }


  // Helper function to get role variant for badge styling
  const getRoleVariant = (role) => {
    if (role === 'super_admin' || role === 'Super Admin') return 'destructive';
    return 'secondary';
  };

  // Helper function to get status variant for badge styling
  const getStatusVariant = (status) => {
    if (status && (status.toLowerCase() === 'active' || status === 'Active')) return 'success';
    return 'default';
  };

  // Map API user data to component format
  const mapApiUserToComponent = (apiUser) => {
    const displayRole = roleApiToDisplay[apiUser.user_role] || apiUser.user_role;
    const displayStatus = apiUser.status ?
      (apiUser.status.charAt(0).toUpperCase() + apiUser.status.slice(1).toLowerCase()) :
      'Active';

    const rawPhone = apiUser.mobile_no || '';
    const userCountry = apiUser.country || 'US';  // Default to US
    const displayPhone = formatPhoneNumber(rawPhone, userCountry);  // Use country-aware format

    return {
      id: apiUser.id,
      name: `${apiUser.first_name} ${apiUser.last_name}`,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      email: apiUser.email,
      phone: displayPhone,
      mobileNo: rawPhone,
      countryCode: apiUser.country_code || '',
      role: displayRole,
      status: displayStatus,
      lastLogin: apiUser.created_at ? new Date(apiUser.created_at).toLocaleString() : 'Never',
      roleVariant: getRoleVariant(apiUser.user_role),
      statusVariant: getStatusVariant(apiUser.status),
      country: apiUser.country || '',
      gender: apiUser.gender,
      username: apiUser.username || ''
    };
  };

  // Fetch admin users on component mount
  useEffect(() => {
    if (adminEmail !== '') {
      fetchAdminUsers();
      console.log("maillogged", adminEmail);
    }
  }, [adminEmail]);

  const fetchAdminUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_name: 'get_management_users',
            admin_email: adminEmail
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedUsers = result.data.map(mapApiUserToComponent);
        setAdminUsers(mappedUsers);
        console.log(`Successfully loaded ${result.count} admin users`);
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      // alert(`Failed to fetch admin users: ${error.message}`);
      toast.error(`Failed to fetch admin users: ${error.message}`)

      // Fallback to empty array
      setAdminUsers([]);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset errors when form data changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData]);

  // Filter users based on selected filters
  const filteredUsers = adminUsers.filter(user => {
    const roleMatch = roleFilter === 'All Roles' || user.role === roleFilter;
    const statusMatch = statusFilter === 'All Status' || user.status === statusFilter;
    return roleMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  }
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, adminUsers]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isAddMode) {
      // Additional validation for update mode
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else {
        const digits = extractPhoneDigits(formData.phone, formData.country);
        if (digits.length !== 10) {
          newErrors.phone = 'Phone number must be 10 digits';
        }
      }
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event Handlers
  const handleAddAdminClick = () => {
    setIsAddMode(true);
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      country: '',
      role: '',
      status: ''
    });
    setErrors({});
    setIsSheetOpen(true);
  };

  const handleEditClick = (user) => {
    setIsAddMode(false);
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: formatPhoneNumber(user.mobileNo, user.country),
      username: user.username,
      country: user.country,
      role: user.role,
      status: user.status
    });
    setErrors({});
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedUser(null);
    setIsAddMode(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // Apply phone formatting for phone field
    if (id === 'phone') {
      const formatted = formatPhoneNumber(value, formData.country);
      setFormData(prev => ({
        ...prev,
        [id]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };
  const handleSelectCountry = (country) => {
    setFormData(prev => ({
      ...prev,
      country, phone: ""
    }));
    setCountryOpen(false);
  }

  const handleCreateAdmin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Extract digits from formatted phone
      const phoneDigits = extractPhoneDigits(formData.phone, formData.country);

      const payload = {
        action: 'create-admin-user',
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: phoneDigits,
        creator_email: userEmail,
        role: roleDisplayToApi[formData.role] || formData.role.toLowerCase(),
        status: formData.status.toLowerCase()
      };

      const response = await fetch(
        'https://user-creation-role-wise-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage =
          (isJson && data.message) ||
          data.error ||
          `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('Admin created successfully:', data);
      // alert('Admin user created successfully!');
      toast.success('Admin user created successfully!');

      // Refresh the list
      await fetchAdminUsers();

      handleCloseSheet();

    } catch (error) {
      console.error('Error creating admin:', error);
      setErrors({
        submit: error.message || 'Failed to create admin user. Please try again.'
      });
      toast.error(error.message || 'Failed to create admin user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Extract digits from formatted phone
      const phoneDigits = extractPhoneDigits(formData.phone, formData.country);

      const payload = {
        task_name: 'update_management_user',
        admin_email: adminEmail,
        user_email: selectedUser.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: roleDisplayToApi[formData.role] || formData.role.toLowerCase(),
        username: formData.username,
        country: formData.country,
        mobile_no: phoneDigits,
        status: formData.status.toLowerCase()
      };

      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        console.log('Admin updated successfully:', result);
        toast.success('Admin user updated successfully!');

        // Refresh the list
        await fetchAdminUsers();

        handleCloseSheet();
      } else {
        throw new Error(result.message || 'Failed to update admin user');
      }

    } catch (error) {
      console.error('Error updating admin:', error);
      setErrors({
        submit: error.message || 'Failed to update admin user. Please try again.'
      });
      toast.error(error.message || 'Failed to update admin user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeletingUser(user.id);

    try {
      const payload = {
        task_name: 'delete_management_user',
        admin_email: adminEmail,
        user_email: user.email
      };

      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        console.log('User deleted successfully:', result);
        toast.success('User deleted successfully!');

        // Remove user from local state
        setAdminUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      } else {
        throw new Error(result.message || 'Failed to delete user');
      }

    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
    } finally {
      setIsDeletingUser(null);
    }
  };
  // 1. Triggered when the trash icon is clicked
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // 2. Triggered when "Yes, Delete" is clicked in the popup
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(userToDelete.id); // Start loading spinner

    try {
      const payload = {
        task_name: 'delete_management_user',
        admin_email: adminEmail,
        user_email: userToDelete.email
      };

      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        console.log('User deleted successfully:', result);
        toast.success('User deleted successfully!');

        // Remove user from local state
        setAdminUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));

        // Close modal
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        throw new Error(result.message || 'Failed to delete user');
      }

    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
    } finally {
      setIsDeletingUser(null); // Stop loading spinner
    }
  };

  // 3. Close modal handler
  const cancelDelete = () => {
    if (isDeletingUser) return; // Prevent closing if API is currently running
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    const country = formData.country;
    if (!country) {
      setErrors((prev) => ({ ...prev, phone: "Please select a country first" }));
      return;
    }
    // Format the phone number based on country
    const formatted = formatPhoneNumber(value, country);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    setErrors((prev) => {
      if (!prev.phone) return prev;
      const next = { ...prev };
      delete next.phone;
      return next;
    });
  }

  const getBadgeClasses = (variant) => {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
      default: "text-foreground"
    };

    return `${baseClasses} ${variants[variant]}`;
  };

  return (
    <>
      <div className="flex-1 ">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
              <p className="text-muted-foreground">
                Manage admin users and their access levels
              </p>
            </div>
            <button
              onClick={handleAddAdminClick}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </button>
          </div>

          {/* Filters Section */}
          <div className="flex gap-4">
            {/* Role Filter Dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
              >
                <span>{roleFilter}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute top-full mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-50">
                  {roleOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setRoleFilter(option);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${roleFilter === option ? 'bg-accent' : ''
                        }`}
                    >
                      {roleFilter === option && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span className={roleFilter !== option ? 'ml-6' : ''}>
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[150px]"
              >
                <span>{statusFilter}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute top-full mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-50">
                  {statusOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${statusFilter === option ? 'bg-accent' : ''
                        }`}
                    >
                      {statusFilter === option && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      <span className={statusFilter !== option ? 'ml-6' : ''}>
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Admin Users
              </h3>
            </div>
            <div className="p-6 pt-0">
              {isFetchingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-3 text-muted-foreground">Loading users...</span>
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Admin Name
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Phone
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Role
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Created At
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <td className="p-4 align-middle font-medium">
                              {user.name}
                            </td>
                            <td className="p-4 align-middle">{user.email}</td>
                            <td className="p-4 align-middle text-sm">
                              {/* {`
                             ${user.country == "india" || user.country == "India" ? formatPhoneNumber(user.phone, user.country) : formatPhoneNumber(user.phone, "US")}
                            `} */}
                              {user.phone}
                            </td>
                            <td className="p-4 align-middle capitalize">
                              <div className={getBadgeClasses(user.roleVariant)}>
                                {user.role}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className={getBadgeClasses(user.statusVariant)}>
                                {user.status}
                              </div>
                            </td>
                            <td className="p-4 align-middle text-sm">
                              {user.lastLogin}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                  title="Edit user"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(user)}
                                  disabled={isDeletingUser === user.id}
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive bg-background hover:bg-destructive hover:text-destructive-foreground h-9 rounded-md px-3"
                                  title="Delete user"
                                >
                                  {isDeletingUser === user.id ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-muted-foreground">
                            No admin users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {isDeleteModalOpen && userToDelete && (
                    <div
                      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                      onClick={cancelDelete}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white border border-red-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                      >
                        <div className="flex flex-col items-center text-center p-6">

                          {/* Icon Circle */}
                          <div className="rounded-full bg-red-50 p-3 mb-4">
                            <Trash2 className="h-6 w-6 text-red-600" />
                          </div>

                          {/* Text */}
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Delete User?
                          </h3>
                          <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete <span className="font-medium text-slate-900">"{userToDelete.name}"</span>?
                            This action cannot be undone.
                          </p>

                          {/* Warning Box */}
                          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left flex gap-3">
                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                            <span className="text-xs text-red-900 leading-snug">
                              This user will be permanently removed from the system.
                            </span>
                          </div>

                          {/* Buttons */}
                          <div className="flex w-full gap-3">
                            <button
                              type="button"
                              onClick={cancelDelete}
                              disabled={!!isDeletingUser}
                              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                            >
                              No, Cancel
                            </button>

                            <button
                              type="button"
                              onClick={confirmDeleteUser}
                              disabled={!!isDeletingUser}
                              className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isDeletingUser ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Deleting...
                                </>
                              ) : (
                                "Yes, Delete"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Showing {filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">No. of rows</p>
                        <input
                          type="number"
                          // min={1}
                          // max={totalPages}
                          placeholder={itemsPerPage}
                          // value={currentPage}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : 5;
                            setItemsPerPage(val);
                          }}
                          className="h-8 w-[60px] rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </div>
                        <button
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Go to first page</span>
                          <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Go to previous page</span>
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <span className="sr-only">Go to next page</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          <span className="sr-only">Go to last page</span>
                          <ChevronsRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Admin Sheet */}
      {isSheetOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={handleCloseSheet}
          />

          {/* Sheet Content */}
          <div
            role="dialog"
            aria-labelledby="sheet-title"
            aria-describedby="sheet-description"
            data-state="open"
            className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right w-full sm:max-w-[500px] overflow-y-auto"
            tabIndex="-1"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Sheet Header */}
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 id="sheet-title" className="text-lg font-semibold text-foreground">
                {isAddMode ? 'Add New Admin' : 'Edit Admin'}
              </h2>
              <p id="sheet-description" className="text-sm text-muted-foreground">
                {isAddMode ? 'Create a new admin user account' : 'Update the admin user details below'}
              </p>
            </div>

            {/* Form Content */}
            <div className="space-y-5 py-6">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="firstName"
                    className={`flex h-10 w-full rounded-md border ${errors.firstName ? 'border-destructive' : 'border-input'
                      } bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="lastName"
                    className={`flex h-10 w-full rounded-md border ${errors.lastName ? 'border-destructive' : 'border-input'
                      } bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-destructive' : 'border-input'
                    } bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isAddMode}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Username (Only for Edit Mode) */}
              {!isAddMode && (
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Username <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    className={`flex h-10 w-full rounded-md border ${errors.username ? 'border-destructive' : 'border-input'
                      } bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                    placeholder="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                  )}
                </div>
              )}

              {/* Country (Only for Edit Mode) */}
              {/* {!isAddMode && (
                <div className="space-y-2">
                  <label
                    htmlFor="country"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Country <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    className={`flex h-10 w-full rounded-md border ${errors.country ? 'border-destructive' : 'border-input'
                      } bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                    placeholder="India"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country}</p>
                  )}
                </div>
              )} */}
              <div className='grid grid-cols-2 gap-4'>
                {/* ✅ Country Dropdown with outside click detection */}
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium leading-none">
                    Country
                  </label>
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                      onClick={() => !loading && setCountryOpen((v) => !v)}
                      role="combobox"
                      aria-expanded={countryOpen}
                      disabled={loading}
                    >
                      <span>{selectedCountryLabel}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {countryOpen && !loading && (
                      <div className="absolute z-10 left-0 w-full mt-1 bg-white border rounded shadow-lg">
                        {countryOptions.map((opt) => (
                          <div
                            key={opt.value}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelectCountry(opt.value)}
                            role="option"
                            aria-selected={formData.country === opt.value}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.country && <div className="text-red-600 text-sm mt-1">{errors.country}</div>}
                </div>


                {/* Phone Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Phone Number {!isAddMode && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={`flex h-10 w-full rounded-md border ${errors.phone ? 'border-destructive' : 'border-input'
                      } bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
                    placeholder={formData.country == "US" || formData.country == "USA" ? "+1 (555) 123-4567" : "+91 8920 970203"}
                    value={formData.phone}
                    onChange={handlePhoneInput}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>


              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Role <span className="text-destructive">*</span>
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full items-center justify-between rounded-md border ${errors.role ? 'border-destructive' : 'border-input'
                    } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">Select role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Status <span className="text-destructive">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full items-center justify-between rounded-md border ${errors.status ? 'border-destructive' : 'border-input'
                    } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status}</p>
                )}
              </div>

              {/* Show submit error if exists */}
              {errors.submit && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Sheet Footer */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseSheet}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={isAddMode ? handleCreateAdmin : handleUpdateAdmin}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {isAddMode ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>{isAddMode ? 'Create Admin' : 'Update Admin'}</>
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseSheet}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default MainDashboard;
