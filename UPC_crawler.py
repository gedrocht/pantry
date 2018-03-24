#!C:\Python27\python
print "Content-Type: text/html"
print "" #use this double quote print statement to add a blank line in the script

import urllib;
import sys;

def getPage( url ):
    page = ""
    while True:
        try:
            print "Opening...";
            http = urllib.urlopen(url);
            line = ""
            while True:
                line = http.readline();
                if len(line) == 0:
                    break;
                page += line
        except Exception,e:
            continue;
        break;
    return page;
    
#page = getPage("http://www.upcdatabase.com/item/" + sys.argv[1])
page = getPage("http://www.upcdatabase.com/item/" + "012546600026")
index = page.find("Description") + 29
print page[index:index+30]