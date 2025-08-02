import { debugStaffAction, getStaffWithFilters } from '../actions';

export default async function TestDirectusPage() {
  let debugData = null;
  let staffData = null;
  let error = null;

  try {
    // Test debug function
    debugData = await debugStaffAction();
    
    // Test getting staff with filters
    staffData = await getStaffWithFilters({ limit: 5 });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-tint-authority p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-soi-navy-800 mb-8">Directus Staff Integration Test</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Debug Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-soi-navy-200">
          <h2 className="text-xl font-semibold text-soi-navy-800 mb-4">Debug Data</h2>
          <pre className="bg-soi-navy-50 p-4 rounded text-sm overflow-auto border border-soi-navy-200">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>

        {/* Staff Data */}
        <div className="bg-white rounded-lg shadow p-6 border border-soi-navy-200">
          <h2 className="text-xl font-semibold text-soi-navy-800 mb-4">Staff Data</h2>
          {staffData && (
            <div className="space-y-4">
              <div className="text-sm text-soi-navy-600">
                Found {staffData.total} staff members, showing {staffData.staff.length}
              </div>
              
              <div className="grid gap-4">
                {staffData.staff.map((staff) => (
                  <div key={staff.id} className="border border-soi-navy-200 rounded p-4 bg-soi-navy-25">
                    <h3 className="font-semibold text-soi-navy-800">{staff.title}</h3>
                    <p className="text-sm text-soi-navy-600">Slug: {staff.slug}</p>
                    <p className="text-sm text-soi-navy-600">Category: {staff.category || 'None'}</p>
                    <p className="text-sm text-soi-navy-600">Status: {staff.status}</p>
                    <p className="text-sm text-soi-navy-600">Featured: {staff.is_featured ? 'Yes' : 'No'}</p>
                    {staff.excerpt && (
                      <p className="text-sm text-soi-navy-700 mt-2">{staff.excerpt}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!staffData && (
            <p className="text-soi-navy-500">No staff data available</p>
          )}
        </div>
      </div>
    </div>
  );
} 