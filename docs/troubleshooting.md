# Troubleshooting Guide

This guide helps you resolve common issues when using the CloudWatch to Grafana Alert Translator.

## Table of Contents

- [Common Issues](#common-issues)
- [JSON Parsing Errors](#json-parsing-errors)
- [Validation Failures](#validation-failures)
- [Translation Problems](#translation-problems)
- [Browser Issues](#browser-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tips](#debugging-tips)
- [Getting Help](#getting-help)

---

## Common Issues

### Application Won't Load

**Symptoms:**
- Blank page or error when opening the application
- Console errors in browser developer tools

**Solutions:**
1. **Check File Paths**: Ensure all files are in the correct directory structure
2. **Browser Compatibility**: Use a modern browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
3. **JavaScript Errors**: Open browser developer tools (F12) and check for JavaScript errors
4. **File Permissions**: Ensure files are readable by the web server

**Debug Steps:**
```bash
# Check if files exist
ls -la index.html styles.css app.js alertTranslator.js

# Test with a simple HTTP server
python -m http.server 8080
# or
npx http-server . -p 8080
```

### Translation Button Not Working

**Symptoms:**
- Clicking "Translate to Grafana Alert" does nothing
- No error messages appear

**Solutions:**
1. **Check JSON Input**: Ensure valid JSON is entered in the input field
2. **Required Fields**: Verify all required fields are present
3. **Browser Console**: Check for JavaScript errors in browser console
4. **Button State**: Ensure button is not disabled

**Debug Steps:**
```javascript
// Open browser console and check for errors
console.log('Translator loaded:', typeof AlertTranslator);

// Test with example data
document.getElementById('cloudWatchInput').value = '{"alarmName":"test","metricName":"test","namespace":"AWS/EC2","statistic":"Average","period":300,"threshold":80,"comparisonOperator":"GreaterThanThreshold","evaluationPeriods":2,"datapointsToAlarm":2,"dimensions":[]}';
```

---

## JSON Parsing Errors

### Invalid JSON Format

**Error Message:**
```
Invalid JSON format: Unexpected token '}' in JSON at position 123
```

**Common Causes:**
- Missing quotes around strings
- Trailing commas
- Unescaped special characters
- Malformed arrays or objects

**Solutions:**
1. **Validate JSON**: Use a JSON validator or online tool
2. **Check Quotes**: Ensure all strings are properly quoted
3. **Remove Trailing Commas**: Remove commas after the last element
4. **Escape Characters**: Escape special characters in strings

**Example Fixes:**
```json
// ❌ Wrong - Missing quotes
{
  "alarmName": test,
  "metricName": CPUUtilization
}

// ✅ Correct - Proper quotes
{
  "alarmName": "test",
  "metricName": "CPUUtilization"
}

// ❌ Wrong - Trailing comma
{
  "alarmName": "test",
  "metricName": "CPUUtilization",
}

// ✅ Correct - No trailing comma
{
  "alarmName": "test",
  "metricName": "CPUUtilization"
}
```

### Malformed Dimensions

**Error Message:**
```
Invalid dimensions JSON: Each dimension must have Name and Value properties
```

**Common Causes:**
- Missing Name or Value properties
- Incorrect array structure
- Wrong data types

**Solutions:**
```json
// ❌ Wrong - Missing Value
{
  "dimensions": [
    {"Name": "InstanceId"}
  ]
}

// ❌ Wrong - Wrong structure
{
  "dimensions": {
    "InstanceId": "i-1234567890abcdef0"
  }
}

// ✅ Correct - Proper structure
{
  "dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

---

## Validation Failures

### Missing Required Fields

**Error Message:**
```
Missing required field: alarmName
```

**Required Fields:**
- `alarmName`
- `metricName`
- `namespace`
- `statistic`
- `threshold`

**Solutions:**
1. **Check Field Names**: Ensure exact field names are used
2. **Non-Empty Values**: Ensure fields are not empty strings
3. **Correct Data Types**: Use strings for text fields, numbers for numeric fields

**Example:**
```json
{
  "alarmName": "HighCPUUtilization",  // ✅ Required string
  "metricName": "CPUUtilization",     // ✅ Required string
  "namespace": "AWS/EC2",             // ✅ Required string
  "statistic": "Average",             // ✅ Required string
  "threshold": 80.0,                  // ✅ Required number
  "period": 300,                      // ✅ Optional number
  "comparisonOperator": "GreaterThanThreshold", // ✅ Optional string
  "evaluationPeriods": 2,             // ✅ Optional number
  "datapointsToAlarm": 2,             // ✅ Optional number
  "dimensions": []                    // ✅ Optional array
}
```

### Invalid Threshold Values

**Error Message:**
```
Threshold must be a positive number
```

**Solutions:**
```json
// ❌ Wrong - Negative threshold
{
  "threshold": -80.0
}

// ❌ Wrong - String instead of number
{
  "threshold": "80"
}

// ✅ Correct - Positive number
{
  "threshold": 80.0
}
```

### Invalid Period Values

**Error Message:**
```
Period must be at least 60 seconds
```

**Solutions:**
```json
// ❌ Wrong - Too short period
{
  "period": 30
}

// ✅ Correct - Valid period
{
  "period": 300
}
```

### Invalid Evaluation Periods

**Error Message:**
```
Datapoints to alarm cannot be greater than evaluation periods
```

**Solutions:**
```json
// ❌ Wrong - datapointsToAlarm > evaluationPeriods
{
  "evaluationPeriods": 2,
  "datapointsToAlarm": 3
}

// ✅ Correct - datapointsToAlarm <= evaluationPeriods
{
  "evaluationPeriods": 3,
  "datapointsToAlarm": 2
}
```

---

## Translation Problems

### Unsupported Metrics

**Symptoms:**
- Translation works but uses fallback naming
- Metric names don't match expected Prometheus format

**Solutions:**
1. **Check Supported Metrics**: Review the list of supported metrics
2. **Use Fallback Naming**: The tool automatically converts unsupported metrics
3. **Custom Mapping**: Add custom metric mappings if needed

**Supported Metrics:**
```javascript
// Check supported metrics
const translator = new AlertTranslator();
console.log(translator.getSupportedMetrics());
```

### Incorrect Prometheus Queries

**Symptoms:**
- Generated queries don't work in Prometheus
- Missing or incorrect metric names

**Solutions:**
1. **Verify Metric Names**: Ensure CloudWatch metrics are available in Prometheus
2. **Check Dimensions**: Verify dimension names and values
3. **Test Queries**: Test queries in Prometheus before using in Grafana

**Debug Steps:**
```bash
# Test Prometheus query
curl 'http://localhost:9090/api/v1/query?query=aws_ec2_cpu_utilization_percent'

# Check available metrics
curl 'http://localhost:9090/api/v1/label/__name__/values'
```

### YAML Formatting Issues

**Symptoms:**
- YAML output is malformed
- Grafana can't parse the alert rules

**Solutions:**
1. **Validate YAML**: Use a YAML validator
2. **Check Indentation**: Ensure proper indentation (2 spaces)
3. **Escape Characters**: Properly escape special characters

**Example:**
```yaml
# ✅ Correct YAML format
groups:
- name: cloudwatch-alerts
  rules:
  - alert: HighCPUUtilization
    expr: avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"})
    for: 10m
    labels:
      severity: warning
      source: cloudwatch
    annotations:
      summary: HighCPUUtilization alert
```

---

## Browser Issues

### Copy to Clipboard Not Working

**Symptoms:**
- "Copy to Clipboard" button doesn't work
- No feedback when clicking copy button

**Solutions:**
1. **HTTPS Required**: Clipboard API requires HTTPS in production
2. **Browser Permissions**: Check browser permissions for clipboard access
3. **Fallback Method**: The tool includes a fallback for older browsers

**Debug Steps:**
```javascript
// Check clipboard API support
if (navigator.clipboard) {
  console.log('Clipboard API supported');
} else {
  console.log('Clipboard API not supported');
}
```

### JavaScript Errors

**Symptoms:**
- Console errors in browser developer tools
- Application features not working

**Solutions:**
1. **Check Console**: Open browser developer tools (F12) and check console
2. **Clear Cache**: Clear browser cache and reload
3. **Disable Extensions**: Disable browser extensions that might interfere
4. **Update Browser**: Ensure browser is up to date

**Common Console Errors:**
```javascript
// ReferenceError: AlertTranslator is not defined
// Solution: Check if alertTranslator.js is loaded

// TypeError: Cannot read property 'value' of null
// Solution: Check if HTML elements exist

// SyntaxError: Unexpected token
// Solution: Check for JavaScript syntax errors
```

---

## Performance Issues

### Slow Translation

**Symptoms:**
- Translation takes a long time
- Browser becomes unresponsive

**Solutions:**
1. **Large JSON**: Break down large alarm configurations
2. **Browser Resources**: Close other browser tabs
3. **Complex Queries**: Simplify complex metric queries

### Memory Issues

**Symptoms:**
- Browser crashes or becomes slow
- High memory usage

**Solutions:**
1. **Clear Input**: Use the "Clear" button to reset
2. **Refresh Page**: Reload the page to clear memory
3. **Browser Restart**: Restart the browser if issues persist

---

## Debugging Tips

### Enable Debug Mode

Add debug logging to the application:

```javascript
// Add to app.js
const DEBUG = true;

function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Use in translation
debugLog('Input JSON:', jsonInput);
debugLog('Parsed alarm:', alarmData);
debugLog('Translation result:', grafanaAlertRule);
```

### Test Individual Components

```javascript
// Test JSON parsing
try {
  const alarm = JSON.parse(jsonInput);
  console.log('JSON parsing successful:', alarm);
} catch (error) {
  console.error('JSON parsing failed:', error);
}

// Test validation
try {
  translator.validateInput(alarm);
  console.log('Validation successful');
} catch (error) {
  console.error('Validation failed:', error);
}

// Test translation
try {
  const result = translator.translateToGrafanaAlert(alarm);
  console.log('Translation successful:', result);
} catch (error) {
  console.error('Translation failed:', error);
}
```

### Check Network Requests

```javascript
// Monitor network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args);
  return originalFetch.apply(this, args);
};
```

---

## Getting Help

### Self-Help Resources

1. **Documentation**: Check the [API Reference](./api-reference.md) for detailed information
2. **Examples**: Review [Example Alarms](./example-alarms.md) for working examples
3. **Browser Console**: Check browser developer tools for error messages
4. **Test Cases**: Run the test suite to verify functionality

### Reporting Issues

When reporting issues, include:

1. **Browser Information**: Browser name, version, and operating system
2. **Error Messages**: Complete error messages from console
3. **Input Data**: The JSON input that caused the issue (remove sensitive information)
4. **Steps to Reproduce**: Detailed steps to reproduce the issue
5. **Expected Behavior**: What you expected to happen
6. **Actual Behavior**: What actually happened

### Example Issue Report

```
**Browser**: Chrome 91.0.4472.124 on Windows 10
**Error**: "Missing required field: alarmName"
**Input JSON**: {"metricName": "CPUUtilization", "namespace": "AWS/EC2", ...}
**Steps**: 
1. Paste JSON into input field
2. Click "Translate to Grafana Alert"
3. See error message
**Expected**: Translation should work
**Actual**: Validation error occurs
```

### Community Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/yourusername/cloudwatch-alarm-grafana-alert/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/yourusername/cloudwatch-alarm-grafana-alert/discussions)
- **Documentation**: Check the docs folder for additional resources

---

## Prevention Tips

### Best Practices

1. **Validate Input**: Always validate JSON before translation
2. **Use Examples**: Start with working examples and modify gradually
3. **Test Incrementally**: Test small changes rather than large modifications
4. **Keep Backups**: Save working configurations
5. **Document Changes**: Keep track of modifications and their effects

### Common Mistakes to Avoid

1. **Incorrect Field Names**: Use exact field names from the documentation
2. **Wrong Data Types**: Use strings for text, numbers for numeric values
3. **Missing Required Fields**: Include all required fields
4. **Invalid JSON**: Ensure proper JSON syntax
5. **Unsupported Metrics**: Check if metrics are supported or use fallback naming

---

This troubleshooting guide should help you resolve most common issues. If you continue to experience problems, please refer to the [Getting Help](#getting-help) section for additional support options.
