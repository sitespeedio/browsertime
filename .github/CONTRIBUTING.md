# How to contribute
Browsertime needs help from the users so please contribute!

## Making changes
If you want help out, that's great! Check the issue list and see if there's something there you want to do and drop Peter a note so we know and we can help you get into the project.
 - Create a new branch for your change
 - Make commits of logical units and write an informative message
 - Make sure you have added the tests needed for your change
 - Run all the tests to make sure you haven't broken anything else (it happens to the best!)

### AI-Assisted changes

When using AI tools like Claude, ChatGPT, or any other LLM to assist with development, please disclose it in your commits and in the pull request description.

#### Commits

Add a `Co-authored-by:` trailer to the commit message body naming the model. GitHub recognises the trailer and credits the model alongside the human author, which keeps the disclosure visible on every commit page without relying on a custom convention. Use a sensible model identifier in the name part and the vendor's published noreply address. Multiple `Co-authored-by:` lines are allowed if more than one model contributed.

**Example:**

```
Add Cumulative Layout Shift metric to the summary page

Add the Cumulative Layout Shift (CLS) introduced by Google on
the summary page. Show both median and p75.

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
```

#### Pull Requests

When creating a pull request that includes AI-assisted work, please mention it in the pull request description.

**Example:**

> This pull request implements Cumulative Layout Shift with assistance from Claude.


## Add a defect
First, check the defect/bug list https://github.com/sitespeedio/browsertime/issues?q=is%3Aissue+is%3Aopen+label%3Abug to make sure that it hasn't been filed yet.

If you find a defect, please file a bug report and follow the instructions in https://www.sitespeed.io/documentation/sitespeed.io/bug-report/

If you have the skills & the time, it is perfect if you send a pull request with a fix, that helps me alot!

## Add a change request/new functionality request
If you have an idea or something that you want browsertim to handle, add an issue and lets discuss it there. Ideas/changes/requests are very very welcome!


Thanks for your support & time!

Peter
