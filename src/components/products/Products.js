import React from 'react';

export default function Products({
  products,
  newProductGSM,
  setNewProductGSM,
  newProductType,
  setNewProductType,
  newProductUnitPrice,
  setNewProductUnitPrice,
  handleAddProduct,
  pageLoading,
  userRole,
  editingProduct,
  setEditingProduct,
  handleUpdateProduct,
  handleCancelEditProduct,
  handleDeleteProduct,
  handleEditProduct,
  currentProductPage,
  setCurrentProductPage,
  itemsPerPage,
}) {
  const indexOfLastItem = currentProductPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const exportProductsToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'GSM,Type,Unit Price (৳)\n';
    products.forEach((product) => {
      csvContent += `${product.gsm},${product.type === 'sheet' ? 'Sheet' : 'Bag'},${product.unitPrice.toFixed(2)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'products_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Product Management
      </h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Add New Product
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="GSM (e.g., 150 GSM PP)"
            value={newProductGSM}
            onChange={(e) => setNewProductGSM(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
          <select
            value={newProductType}
            onChange={(e) => setNewProductType(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          >
            <option value="sheet">Sheet</option>
            <option value="bag">Bag</option>
          </select>
          <input
            type="number"
            placeholder={`Unit Price (৳ per ${newProductType === 'sheet' ? 'sq. meter' : 'piece'})`}
            value={newProductUnitPrice}
            onChange={(e) => setNewProductUnitPrice(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
          />
        </div>
        <button
          onClick={handleAddProduct}
          className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-lg"
          disabled={pageLoading || (userRole !== 'admin' && userRole !== 'super_admin')}
        >
          {pageLoading ? 'Adding...' : 'Add Product'}
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={exportProductsToCSV}
          className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-lg"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Existing Products
        </h3>
        {currentItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No products added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    GSM
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Unit Price (৳)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {product.gsm}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        {product.type === 'sheet' ? 'Sheet' : 'Bag'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                        ৳ {product.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs hover:bg-yellow-600 mr-1 transition-colors"
                          disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                          disabled={userRole !== 'admin' && userRole !== 'super_admin'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {editingProduct && editingProduct.id === product.id && (
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <td colSpan="4" className="p-4">
                          <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">
                            Edit Product: {editingProduct.gsm}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                            <input
                              type="text"
                              placeholder="GSM"
                              value={editingProduct.gsm}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, gsm: e.target.value })
                              }
                              className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                            />
                            <select
                              value={editingProduct.type}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, type: e.target.value })
                              }
                              className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                            >
                              <option value="sheet">Sheet</option>
                              <option value="bag">Bag</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Unit Price"
                              value={editingProduct.unitPrice}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, unitPrice: e.target.value })
                              }
                              className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateProduct}
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                              disabled={pageLoading}
                            >
                              {pageLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                              onClick={handleCancelEditProduct}
                              className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-1">
            <button
              onClick={() => setCurrentProductPage((prev) => Math.max(1, prev - 1))}
              disabled={currentProductPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentProductPage(page)}
                className={`px-3 py-1 rounded-md text-sm ${currentProductPage === page ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentProductPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentProductPage === totalPages}
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
