/**
 * AWS CloudWatch to Grafana Alert Translator
 * 
 * This module provides functionality to convert AWS CloudWatch alarms
 * to Grafana alert rules that work with Prometheus backends.
 */

class AlertTranslator {
    constructor() {
        this.supportedMetrics = {
            'AWS/EC2': {
                'CPUUtilization': 'aws_ec2_cpu_utilization_percent',
                'NetworkIn': 'aws_ec2_network_in_bytes',
                'NetworkOut': 'aws_ec2_network_out_bytes',
                'DiskReadOps': 'aws_ec2_disk_read_ops_total',
                'DiskWriteOps': 'aws_ec2_disk_write_ops_total'
            },
            'AWS/RDS': {
                'CPUUtilization': 'aws_rds_cpu_utilization_percent',
                'DatabaseConnections': 'aws_rds_database_connections',
                'FreeableMemory': 'aws_rds_freeable_memory_bytes',
                'FreeStorageSpace': 'aws_rds_free_storage_space_bytes'
            },
            'AWS/ELB': {
                'RequestCount': 'aws_elb_request_count_total',
                'Latency': 'aws_elb_target_response_time_seconds',
                'HTTPCode_Target_2XX_Count': 'aws_elb_http_2xx_requests_total',
                'HTTPCode_Target_4XX_Count': 'aws_elb_http_4xx_requests_total',
                'HTTPCode_Target_5XX_Count': 'aws_elb_http_5xx_requests_total'
            },
            'AWS/S3': {
                'BucketSizeBytes': 'aws_s3_bucket_size_bytes',
                'NumberOfObjects': 'aws_s3_bucket_number_of_objects'
            }
        };
    }

    /**
     * Translate CloudWatch alarm configuration to Grafana alert rule
     * @param {Object} cloudWatchAlarm - CloudWatch alarm configuration
     * @param {Object} options - Additional options for translation
     * @param {string} options.folder - Folder name for the alert
     * @param {string} options.noDataState - No data state handling
     * @param {string} options.metricFormat - Metric format (yace or push_metric)
     * @returns {Object} Grafana alert rule
     */
    translateToGrafanaAlert(cloudWatchAlarm, options = {}) {
        try {
            // Normalize field names to handle both exported and manual formats
            const normalizedAlarm = this.normalizeAlarmData(cloudWatchAlarm);
            
            this.validateInput(normalizedAlarm);
            
            const prometheusMetric = this.convertToPrometheusMetric(
                normalizedAlarm.namespace,
                normalizedAlarm.metricName,
                options.metricFormat
            );
            
            const grafanaQuery = this.buildGrafanaQuery(
                prometheusMetric,
                normalizedAlarm.statistic,
                normalizedAlarm.period,
                normalizedAlarm.dimensions
            );
            
            const alertRule = {
                alert: normalizedAlarm.alarmName,
                expr: grafanaQuery,
                for: this.convertEvaluationPeriods(
                    normalizedAlarm.evaluationPeriods,
                    normalizedAlarm.datapointsToAlarm,
                    normalizedAlarm.period
                ),
                labels: this.buildLabels(normalizedAlarm),
                annotations: this.buildAnnotations(normalizedAlarm)
            };
            
            // Add threshold fields to the alert rule
            if (normalizedAlarm.threshold !== undefined && normalizedAlarm.comparisonOperator) {
                alertRule.threshold = normalizedAlarm.threshold;
                alertRule.condition = this.convertComparisonOperator(normalizedAlarm.comparisonOperator);
            }
            
            // Use provided folder or default
            const folder = options.folder || 'cloudwatch';
            const groupName = `${folder.toLowerCase().replace(/\s+/g, '-')}-alerts`;
            
            const group = {
                name: groupName,
                interval: '1m',
                rules: [alertRule]
            };
            
            // Add folder property if provided
            if (options.folder) {
                group.folder = options.folder;
            }
            
            return {
                groups: [group]
            };
        } catch (error) {
            throw new Error(`Translation failed: ${error.message}`);
        }
    }

    /**
     * Normalize alarm data to handle both exported and manual formats
     * @param {Object} alarm - CloudWatch alarm configuration (exported or manual format)
     * @returns {Object} Normalized alarm data with lowercase field names
     */
    normalizeAlarmData(alarm) {
        // Field mapping from exported format to normalized format
        const fieldMapping = {
            'AlarmName': 'alarmName',
            'MetricName': 'metricName',
            'Namespace': 'namespace',
            'Statistic': 'statistic',
            'Period': 'period',
            'Threshold': 'threshold',
            'ComparisonOperator': 'comparisonOperator',
            'EvaluationPeriods': 'evaluationPeriods',
            'DatapointsToAlarm': 'datapointsToAlarm',
            'Dimensions': 'dimensions'
        };
        
        const normalized = {};
        
        // Map fields from exported format to normalized format
        for (const [exportedField, normalizedField] of Object.entries(fieldMapping)) {
            if (alarm[exportedField] !== undefined) {
                normalized[normalizedField] = alarm[exportedField];
            } else if (alarm[normalizedField] !== undefined) {
                // Already in normalized format
                normalized[normalizedField] = alarm[normalizedField];
            }
        }
        
        // Handle dimensions normalization
        if (normalized.dimensions) {
            normalized.dimensions = normalized.dimensions.map(dim => {
                if (dim.Name && dim.Value) {
                    // Already in correct format
                    return dim;
                } else if (dim.name && dim.value) {
                    // Convert lowercase to uppercase
                    return { Name: dim.name, Value: dim.value };
                }
                return dim;
            });
        }
        
        return normalized;
    }

    /**
     * Validate input parameters
     * @param {Object} alarm - CloudWatch alarm configuration
     * @throws {Error} If validation fails
     */
    validateInput(alarm) {
        const requiredFields = ['alarmName', 'metricName', 'namespace', 'statistic', 'threshold'];
        
        for (const field of requiredFields) {
            if (!alarm[field] || alarm[field].toString().trim() === '') {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        if (alarm.threshold < 0) {
            throw new Error('Threshold must be a positive number');
        }
        
        if (alarm.period < 60) {
            throw new Error('Period must be at least 60 seconds');
        }
        
        if (alarm.evaluationPeriods < 1 || alarm.datapointsToAlarm < 1) {
            throw new Error('Evaluation periods and datapoints to alarm must be at least 1');
        }
        
        if (alarm.datapointsToAlarm > alarm.evaluationPeriods) {
            throw new Error('Datapoints to alarm cannot be greater than evaluation periods');
        }
    }

    /**
     * Convert CloudWatch namespace and metric name to Prometheus metric
     * @param {string} namespace - CloudWatch namespace
     * @param {string} metricName - CloudWatch metric name
     * @param {string} metricFormat - Metric format (yace or push_metric)
     * @returns {string} Prometheus metric name
     */
    convertToPrometheusMetric(namespace, metricName, metricFormat = 'yace') {
        if (this.supportedMetrics[namespace] && this.supportedMetrics[namespace][metricName]) {
            return this.supportedMetrics[namespace][metricName];
        }
        
        // Handle different metric formats
        if (metricFormat === 'push_metric') {
            // Push metric format: lowercase with underscores
            const normalizedNamespace = namespace.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const normalizedMetric = metricName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            return `${normalizedNamespace}_${normalizedMetric}`;
        } else {
            // Default YACE format: aws_ prefix with snake_case
            const normalizedNamespace = namespace.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const normalizedMetric = metricName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            return `aws_${normalizedNamespace.replace('aws_', '')}_${normalizedMetric}`;
        }
    }

    /**
     * Build Grafana query expression
     * @param {string} metric - Prometheus metric name
     * @param {string} statistic - CloudWatch statistic
     * @param {number} period - Period in seconds
     * @param {Array} dimensions - CloudWatch dimensions
     * @returns {string} Grafana query expression
     */
    buildGrafanaQuery(metric, statistic, period, dimensions) {
        let query = metric;
        
        // Add dimension filters
        if (dimensions && dimensions.length > 0) {
            const filters = dimensions.map(dim => `${dim.Name}="${dim.Value}"`).join(',');
            query += `{${filters}}`;
        }
        
        // Convert CloudWatch statistic to Prometheus function
        const prometheusFunction = this.convertStatistic(statistic, period);
        if (prometheusFunction) {
            query = `${prometheusFunction}(${query})`;
        }
        
        return query;
    }

    /**
     * Convert CloudWatch statistic to Prometheus function
     * @param {string} statistic - CloudWatch statistic
     * @param {number} period - Period in seconds
     * @returns {string|null} Prometheus function or null
     */
    convertStatistic(statistic, _period) {
        switch (statistic) {
        case 'Average':
            return 'avg_over_time';
        case 'Sum':
            return 'sum_over_time';
        case 'Minimum':
            return 'min_over_time';
        case 'Maximum':
            return 'max_over_time';
        default:
            return null;
        }
    }

    /**
     * Convert CloudWatch comparison operator to Prometheus operator
     * @param {string} operator - CloudWatch comparison operator
     * @returns {string} Prometheus comparison operator
     */
    convertComparisonOperator(operator) {
        switch (operator) {
        case 'GreaterThanThreshold':
            return '>';
        case 'GreaterThanOrEqualToThreshold':
            return '>=';
        case 'LessThanThreshold':
            return '<';
        case 'LessThanOrEqualToThreshold':
            return '<=';
        default:
            return '>';
        }
    }


    /**
     * Convert evaluation periods to Grafana 'for' duration
     * @param {number} evaluationPeriods - Number of evaluation periods
     * @param {number} datapointsToAlarm - Number of datapoints to alarm
     * @param {number} period - Period in seconds
     * @returns {string} Duration string for Grafana
     */
    convertEvaluationPeriods(evaluationPeriods, datapointsToAlarm, period) {
        // Calculate the minimum time needed for the alarm to trigger
        const minPeriods = Math.min(evaluationPeriods, datapointsToAlarm);
        const totalSeconds = minPeriods * period;
        
        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        } else if (totalSeconds < 3600) {
            const minutes = Math.floor(totalSeconds / 60);
            return minutes === 1 ? '1m' : `${minutes}m`;
        } else {
            return `${Math.floor(totalSeconds / 3600)}h`;
        }
    }

    /**
     * Build labels for the alert rule
     * @param {Object} alarm - CloudWatch alarm configuration
     * @returns {Object} Labels object
     */
    buildLabels(alarm) {
        const labels = {
            severity: 'warning',
            source: 'cloudwatch',
            namespace: alarm.namespace,
            metric: alarm.metricName
        };
        
        // Add dimension labels
        if (alarm.dimensions && alarm.dimensions.length > 0) {
            alarm.dimensions.forEach(dim => {
                labels[dim.Name.toLowerCase()] = dim.Value;
            });
        }
        
        return labels;
    }

    /**
     * Build annotations for the alert rule
     * @param {Object} alarm - CloudWatch alarm configuration
     * @returns {Object} Annotations object
     */
    buildAnnotations(alarm) {
        return {
            summary: `${alarm.alarmName} alert`,
            description: `CloudWatch alarm ${alarm.alarmName} for ${alarm.metricName} in ${alarm.namespace}`,
            runbook_url: '',
            dashboard_url: ''
        };
    }

    /**
     * Get supported namespaces and metrics
     * @returns {Object} Supported metrics by namespace
     */
    getSupportedMetrics() {
        return this.supportedMetrics;
    }

    /**
     * Validate JSON input for dimensions
     * @param {string} jsonString - JSON string to validate
     * @returns {Array} Parsed dimensions array
     * @throws {Error} If JSON is invalid
     */
    parseDimensions(jsonString) {
        if (!jsonString || jsonString.trim() === '') {
            return [];
        }
        
        try {
            const parsed = JSON.parse(jsonString);
            if (!Array.isArray(parsed)) {
                throw new Error('Dimensions must be an array');
            }
            
            // Validate dimension structure
            for (const dim of parsed) {
                if (!dim.Name || !dim.Value) {
                    throw new Error('Each dimension must have Name and Value properties');
                }
            }
            
            return parsed;
        } catch (error) {
            throw new Error(`Invalid dimensions JSON: ${error.message}`);
        }
    }
}

// Export for use in browser and tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertTranslator;
} else if (typeof window !== 'undefined') {
    window.AlertTranslator = AlertTranslator;
}
