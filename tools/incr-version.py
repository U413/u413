#!/usr/bin/python
import re
import sys

vre = re.compile(r'''^(\d+)\.(\d+)\.(\d+)(.+)$''')
m = vre.match(open("VERSION", 'r').read())
if m:
	open("VERSION", 'w').write(
		"{}.{}.{}{}".format(
			int(m.group(1)) + int(sys.argv[1]),
			int(m.group(2)) + int(sys.argv[2]),
			int(m.group(3)) + int(sys.argv[3]),
			m.group(4)
		)
	)
