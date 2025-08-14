import { useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

const useCurrentUser= ()=> {
  const init:any = null;
  const [user, setUser] = useState(init);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState(init);

  async function loadUser() {
    try {
      // Make sure session is hydrated before checking user
      await fetchAuthSession();
      const currentUser = await getCurrentUser();
      setUser(currentUser.userId);
      setError(null);
    } catch (err :any) {
        setUser(null); // Signed out
        setError(null);
    } finally {
      setUserLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    // Initial load
    loadUser();

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (!isMounted) return;
      const relevantEvents = [
        'signedIn',
        'signedOut',
        'tokenRefresh',
        'sessionExpired',
        'sessionRestored'
      ];
      if (relevantEvents.includes(payload.event)) {
        setUserLoading(true);
        loadUser();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user, userLoading, error };
}

export default useCurrentUser;  