#!/bin/bash
# Focuses an existing Chrome tab on $URL if one is open; otherwise opens a new tab.
# macOS only (uses osascript to inspect/control Chrome via Apple Events).
URL="http://localhost:8080"

osascript <<OSA
tell application "Google Chrome"
	if not running then
		activate
		delay 1
	end if
	set foundTab to missing value
	set foundWindow to missing value
	repeat with w in windows
		repeat with t in tabs of w
			if (URL of t) starts with "$URL" then
				set foundTab to t
				set foundWindow to w
				exit repeat
			end if
		end repeat
		if foundTab is not missing value then exit repeat
	end repeat
	if foundTab is not missing value then
		set active tab index of foundWindow to (index of foundTab)
		set index of foundWindow to 1
	else
		if (count of windows) = 0 then
			make new window
		end if
		tell window 1 to make new tab with properties {URL:"$URL"}
	end if
	activate
end tell
OSA
