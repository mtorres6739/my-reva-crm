import { useRouteError } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Oops! Something went wrong
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error.statusText || error.message}
          </p>
          {error.status === 404 && (
            <p className="mt-2 text-center text-sm text-gray-500">
              The page you're looking for doesn't exist.
            </p>
          )}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}
