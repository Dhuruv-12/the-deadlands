import glob,sys
head=open('src/head.html').read()
js=''.join(open(f).read()+'\n' for f in sorted(glob.glob('src/0*.js')))
out=head+'<script>\n(function(){\n'+js+'})();\n</script>\n'
open('chennai-dead.html','w').write(out)
open('_check.js','w').write('(function(){\n'+js+'})');
print(len(out))
