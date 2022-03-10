[Index](./index.md)

# Instance Resources

In the service inventory, you can check the resources of an instance.  
The request for the resources required the latest instance version.  
When the instance is transitioning to newer versions, it is hard to pinpoint the latest version.  
If we send the request for the resources with an outdated version, we get a 409 Conflict error response.

This is not helpful for the user. The user just wants to see the data.  
This API endpoint might change in the future. But for now we have implemented a fix in the frontend.  
Most of this logic is implemented in the `QueryManager` for the `GetInstanceResources` query.

When we get a conflict error for the resources request, we fetch the instance again to get the latest version.  
We fetch the resources again with the new instance version. If it fails again, we repeat until it is successful.  
We have a `retryLimit` of 20 so we don't keep retrying indefinitely.

The scheduler mechanism is still active for this query.  
So after we have failed for 20 times, we can show an error.  
But after 5 seconds it will start retrying again.

The scheduler is implemented in a way that is waits for all requests to finish before it schedules a new run.  
So there won't be any problems with duplicate requests being fired at wrong intervals.

The `BaseApiHelper` also contains some extra code to expose the HTTP Status code.  
We need this to detect the `409 Conflict`.

Once the API changes, all this special code can basically be removed.  
The QueryManager can then be reverted to using the `QueryManager.ContinuousWithEnv` class.
