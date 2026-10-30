# real X11 input through XTest: relative mouse motion and key presses (used by t21.js)
import sys,time
from Xlib import X,display,XK
from Xlib.ext import xtest
d=display.Display()
cmd=sys.argv[1]
if cmd=='rel':
    dx,dy,n,ms=int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]),float(sys.argv[5])
    for i in range(n):
        xtest.fake_input(d,X.MotionNotify,detail=1,x=dx,y=dy);d.sync();time.sleep(ms/1000)
elif cmd=='key':
    kc=d.keysym_to_keycode(XK.string_to_keysym(sys.argv[2]))
    xtest.fake_input(d,X.KeyPress,kc);d.sync();time.sleep(0.05);xtest.fake_input(d,X.KeyRelease,kc);d.sync()
elif cmd=='abs':
    xtest.fake_input(d,X.MotionNotify,x=int(sys.argv[2]),y=int(sys.argv[3]));d.sync()
elif cmd=='click':
    xtest.fake_input(d,X.ButtonPress,1);d.sync();time.sleep(0.05);xtest.fake_input(d,X.ButtonRelease,1);d.sync()
