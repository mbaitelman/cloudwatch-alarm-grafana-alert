/**
 * Main application logic for the CloudWatch to Grafana Alert Translator
 */

class CloudWatchTranslatorApp {
    constructor() {
        this.translator = new AlertTranslator();
        this.initializeEventListeners();
        this.initializeSettings();
    }

    initializeEventListeners() {
        const translateBtn = document.getElementById('translateBtn');
        const copyBtn = document.getElementById('copyBtn');
        const cloudWatchInput = document.getElementById('cloudWatchInput');

        translateBtn.addEventListener('click', () => this.translateAlert());
        copyBtn.addEventListener('click', () => this.copyToClipboard());

        // Add keyboard shortcuts
        cloudWatchInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.translateAlert();
            }
        });
    }

    initializeSettings() {
        // Load saved metric format from localStorage
        const savedMetricFormat = localStorage.getItem('metricFormat');
        if (savedMetricFormat) {
            document.getElementById('metricFormatSelect').value = savedMetricFormat;
        }

        // Add event listener for metric format changes to save to localStorage
        document.getElementById('metricFormatSelect').addEventListener('change', (e) => {
            localStorage.setItem('metricFormat', e.target.value);
        });
    }

    translateAlert() {
        try {
            const translateBtn = document.getElementById('translateBtn');
            const grafanaAlert = document.getElementById('grafanaAlert');
            const cloudWatchInput = document.getElementById('cloudWatchInput');
            
            // Show loading state
            translateBtn.textContent = 'Translating...';
            translateBtn.disabled = true;
            grafanaAlert.textContent = '';

            // Get and parse JSON input
            const jsonInput = cloudWatchInput.value.trim();
            if (!jsonInput) {
                throw new Error('Please enter CloudWatch alarm JSON');
            }

            let alarmData;
            try {
                alarmData = JSON.parse(jsonInput);
            } catch (parseError) {
                throw new Error(`Invalid JSON format: ${parseError.message}`);
            }
            
            // Collect additional options
            const options = {
                folder: document.getElementById('folderInput').value.trim() || 'CloudWatch Alerts',
                noDataState: document.getElementById('noDataStateSelect').value,
                metricFormat: document.getElementById('metricFormatSelect').value
            };
            
            // Translate to Grafana alert
            const grafanaAlertRule = this.translator.translateToGrafanaAlert(alarmData, options);
            
            // Display result as YAML
            grafanaAlert.textContent = this.convertToYAML(grafanaAlertRule);
            
            // Show success state
            translateBtn.textContent = 'Translation Complete!';
            translateBtn.classList.add('success-flash');
            
            setTimeout(() => {
                translateBtn.textContent = 'Translate to Grafana Alert';
                translateBtn.classList.remove('success-flash');
            }, 2000);

        } catch (error) {
            this.showError(error.message);
        } finally {
            const translateBtn = document.getElementById('translateBtn');
            translateBtn.disabled = false;
        }
    }


    showError(message) {
        const grafanaAlert = document.getElementById('grafanaAlert');
        const translateBtn = document.getElementById('translateBtn');
        
        grafanaAlert.textContent = `Error: ${message}`;
        grafanaAlert.style.color = '#e53e3e';
        
        translateBtn.textContent = 'Error - Try Again';
        translateBtn.style.background = '#e53e3e';
        
        setTimeout(() => {
            translateBtn.textContent = 'Translate to Grafana Alert';
            translateBtn.style.background = '';
            grafanaAlert.style.color = '';
        }, 3000);
    }

    async copyToClipboard() {
        const grafanaAlert = document.getElementById('grafanaAlert');
        const copyBtn = document.getElementById('copyBtn');
        
        if (!grafanaAlert.textContent || grafanaAlert.textContent.startsWith('Error:')) {
            this.showError('No valid alert to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(grafanaAlert.textContent);
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#48bb78';
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.style.background = '';
            }, 2000);
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(grafanaAlert.textContent);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            const copyBtn = document.getElementById('copyBtn');
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#48bb78';
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.style.background = '';
            }, 2000);
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }

    // Convert JavaScript object to YAML format
    convertToYAML(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';
        
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    yaml += spaces + '- ';
                    if (Object.keys(item).length > 0) {
                        yaml += '\n' + this.convertToYAML(item, indent + 1);
                    } else {
                        yaml += '{}';
                    }
                } else {
                    yaml += spaces + '- ' + this.formatYAMLValue(item);
                }
                if (index < obj.length - 1) {
                    yaml += '\n';
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            const keys = Object.keys(obj);
            keys.forEach((key, index) => {
                const value = obj[key];
                yaml += spaces + key + ':';
                
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        if (value.length === 0) {
                            yaml += ' []';
                        } else {
                            yaml += '\n' + this.convertToYAML(value, indent + 1);
                        }
                    } else if (Object.keys(value).length === 0) {
                        yaml += ' {}';
                    } else {
                        yaml += '\n' + this.convertToYAML(value, indent + 1);
                    }
                } else {
                    yaml += ' ' + this.formatYAMLValue(value);
                }
                
                if (index < keys.length - 1) {
                    yaml += '\n';
                }
            });
        } else {
            yaml += spaces + this.formatYAMLValue(obj);
        }
        
        return yaml;
    }
    
    // Format values for YAML output
    formatYAMLValue(value) {
        if (value === null) {
            return 'null';
        } else if (value === undefined) {
            return 'undefined';
        } else if (typeof value === 'string') {
            // Only quote strings that absolutely need it
            if (value.includes('\n') || value.includes('"') || 
                /^\d/.test(value) || value === 'true' || value === 'false' || value === 'null') {
                return `"${value.replace(/"/g, '\\"')}"`;
            }
            return value;
        } else if (typeof value === 'boolean') {
            return value.toString();
        } else if (typeof value === 'number') {
            return value.toString();
        }
        return String(value);
    }

    // Utility method to populate form with example data
    populateExample() {
        const exampleJson = {
            alarmName: 'HighCPUUtilization',
            metricName: 'CPUUtilization',
            namespace: 'AWS/EC2',
            statistic: 'Average',
            period: 300,
            threshold: 80.0,
            comparisonOperator: 'GreaterThanThreshold',
            evaluationPeriods: 2,
            datapointsToAlarm: 2,
            dimensions: [
                { Name: 'InstanceId', Value: 'i-1234567890abcdef0' }
            ]
        };
        
        document.getElementById('cloudWatchInput').value = JSON.stringify(exampleJson, null, 2);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CloudWatchTranslatorApp();
});

// Add global functions for HTML onclick handlers
window.populateExample = function() {
    const app = new CloudWatchTranslatorApp();
    app.populateExample();
};

window.clearInput = function() {
    document.getElementById('cloudWatchInput').value = '';
    document.getElementById('grafanaAlert').textContent = '';
};
