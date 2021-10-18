[Index](./index.md)

# Other

## Keyboard support

### Context

Actions are executed within a certain context.  
For example, showing the next page of instances on the Inventory.  
We need the link of this specific next page. This data is not available on a global level.  
Only on the component level. So actions are performed on the component level.  
But keyboard events are triggered on the global level.  
How do we provide context to these keyboard actions?

### Possible implementation: Component registers listener for keystroke

A component that does an action should also register a listener for a keystroke.  
When this keystroke is pressed, the listener is executed and the action can be performed.  
This way we indirectly provide context to the keyboard action.

### No inactive listeners

Another benefit of this design is that no inactive listeners are created.  
The listener is created when the component initiates.  
And the listener is destroyed when the component is destroyed.
