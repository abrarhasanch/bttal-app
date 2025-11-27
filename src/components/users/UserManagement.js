import React from 'react';

function UserManagement({
  allUsers,
  currentUserManagementPage,
  setCurrentUserManagementPage,
  itemsPerPage,
  userRole,
  handleUpdateUserStatusAndRole,
}) {
  const indexOfLastItem = currentUserManagementPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allUsers.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        User Management
      </h2>
      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Registered Users
        </h3>
        {currentItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No users found or data is loading.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Registered On
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                      <select
                        defaultValue={user.role}
                        onChange={(e) =>
                          handleUpdateUserStatusAndRole(user.uid, user.status, e.target.value)
                        }
                        className="p-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500"
                        disabled={userRole !== 'super_admin'}
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="pending_approval" disabled>
                          Pending Approval
                        </option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                            : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                              : user.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {user.status !== 'approved' && (
                        <button
                          onClick={() =>
                            handleUpdateUserStatusAndRole(
                              user.uid,
                              'approved',
                              user.role === 'pending_approval' ? 'admin' : user.role
                            )
                          }
                          className="bg-green-500 text-white px-2 py-1 rounded-md text-xs hover:bg-green-600 mr-1 transition-colors"
                          disabled={userRole !== 'super_admin'}
                        >
                          Approve
                        </button>
                      )}
                      {user.status !== 'rejected' && (
                        <button
                          onClick={() =>
                            handleUpdateUserStatusAndRole(user.uid, 'rejected', 'admin')
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 mr-1 transition-colors"
                          disabled={userRole !== 'super_admin'}
                        >
                          Reject
                        </button>
                      )}
                      {user.status === 'rejected' && (
                        <button
                          onClick={() =>
                            handleUpdateUserStatusAndRole(user.uid, 'pending', 'admin')
                          }
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 transition-colors"
                          disabled={userRole !== 'super_admin'}
                        >
                          Re-Pend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
            <button
              onClick={() => setCurrentUserManagementPage((prev) => Math.max(1, prev - 1))}
              disabled={currentUserManagementPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentUserManagementPage(page)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentUserManagementPage === page
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentUserManagementPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentUserManagementPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
