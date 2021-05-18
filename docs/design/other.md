[Index](./index.md)

# Other

## Keyboard support

A concern was raised that keyboard support would be hard to realise with the current design.  
The problem was that triggering an action based on a keystroke lacks context. Because this is done a global level.  
So we would need to implement a command bus that could handle these actions lacking context.  
Which would be different from general actions that have context because they are triggered in the component that has the data.  
But it seems this is not really a problem because we can implement these actions lacking context in a lot of different ways.

One way would be having the component that does an action register a listener for a keystroke.  
This way context is provided to the keyboard actions.
Another benefit is that this creates no useless listeners when the component is not active.  
This is better then having a lot of keystroke listeners not doing anything because the related action is not useful in that specific view.
