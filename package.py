import sys,re
def offline(web):
    three=open('node_modules/three/build/three.min.js').read()
    tag=re.search(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r128/three\.min\.js"[^>]*></script>',web)
    body=web[:tag.start()]+'<script>\n'+three+'\n</script>'+web[tag.end():]
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'+body+'\n</html>'
if sys.argv[1:]==['check']:
    print(offline(open('the-deadlands-web.html').read())==open('The-Deadlands.html').read())
else:
    w=open('chennai-dead.html').read();open('the-deadlands-web.html','w').write(w);open('The-Deadlands.html','w').write(offline(w));print('written')
