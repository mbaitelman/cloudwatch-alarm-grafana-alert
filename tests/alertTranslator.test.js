/**
 * Unit tests for AlertTranslator
 * 
 * This test suite validates the CloudWatch to Grafana alert translation functionality
 */

// Import the AlertTranslator class
const AlertTranslator = require('../alertTranslator.js');

describe('AlertTranslator', () => {
    let translator;

    beforeEach(() => {
        translator = new AlertTranslator();
    });

    describe('translateToGrafanaAlert', () => {
        test('should translate a basic CloudWatch alarm to Grafana alert', () => {
            const cloudWatchAlarm = {
                alarmName: 'HighCPUUtilization',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
            
            expect(result).toHaveProperty('groups');
            expect(result.groups).toHaveLength(1);
            expect(result.groups[0]).toHaveProperty('name', 'cloudwatch-alerts');
            expect(result.groups[0]).toHaveProperty('interval', '1m');
            expect(result.groups[0]).toHaveProperty('rules');
            expect(result.groups[0].rules).toHaveLength(1);

            const rule = result.groups[0].rules[0];
            expect(rule).toHaveProperty('alert', 'HighCPUUtilization');
            expect(rule).toHaveProperty('expr');
            expect(rule).toHaveProperty('for', '10m');
            expect(rule).toHaveProperty('labels');
            expect(rule).toHaveProperty('annotations');
        });

        test('should use custom folder name when provided', () => {
            const cloudWatchAlarm = {
                alarmName: 'HighCPUUtilization',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            const options = { folder: 'Production Alerts' };
            const result = translator.translateToGrafanaAlert(cloudWatchAlarm, options);
            
            expect(result.groups[0]).toHaveProperty('name', 'production-alerts-alerts');
        });

        test('should use push_metric format when specified', () => {
            const cloudWatchAlarm = {
                alarmName: 'CustomMetric',
                metricName: 'CustomMetric',
                namespace: 'AWS/Custom',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            const options = { metricFormat: 'push_metric' };
            const result = translator.translateToGrafanaAlert(cloudWatchAlarm, options);
            const rule = result.groups[0].rules[0];
            
            // Should use push_metric format: aws_custom_custommetric (no aws_ prefix duplication)
            expect(rule.expr).toContain('aws_custom_custommetric');
        });

        test('should include folder in group when provided', () => {
            const cloudWatchAlarm = {
                alarmName: 'TestAlarm',
                metricName: 'TestMetric',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            const options = { folder: 'Production Alerts' };
            const result = translator.translateToGrafanaAlert(cloudWatchAlarm, options);
            const group = result.groups[0];
            
            expect(group).toHaveProperty('folder', 'Production Alerts');
            expect(group.rules[0].labels).not.toHaveProperty('folder'); // Should not be in rule labels
        });

        test('should include dimensions in expression and threshold in separate fields', () => {
            const cloudWatchAlarm = {
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

            const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.expr).toContain('InstanceId="i-1234567890abcdef0"');
            expect(rule.expr).not.toContain('> 80');
            expect(rule.threshold).toBe(80);
            expect(rule.condition).toBe('>');
        });

        test('should convert different statistics correctly', () => {
            const statistics = ['Average', 'Sum', 'Minimum', 'Maximum'];
            
            statistics.forEach(statistic => {
                const cloudWatchAlarm = {
                    alarmName: 'TestAlarm',
                    metricName: 'TestMetric',
                    namespace: 'AWS/EC2',
                    statistic: statistic,
                    period: 300,
                    threshold: 80.0,
                    comparisonOperator: 'GreaterThanThreshold',
                    evaluationPeriods: 2,
                    datapointsToAlarm: 2,
                    dimensions: []
                };

                const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
                const rule = result.groups[0].rules[0];

                switch (statistic) {
                case 'Average':
                    expect(rule.expr).toContain('avg_over_time');
                    break;
                case 'Sum':
                    expect(rule.expr).toContain('sum_over_time');
                    break;
                case 'Minimum':
                    expect(rule.expr).toContain('min_over_time');
                    break;
                case 'Maximum':
                    expect(rule.expr).toContain('max_over_time');
                    break;
                }
            });
        });

        test('should calculate correct duration for different evaluation periods', () => {
            const testCases = [
                { evaluationPeriods: 2, datapointsToAlarm: 2, period: 300, expected: '10m' },
                { evaluationPeriods: 3, datapointsToAlarm: 2, period: 300, expected: '10m' },
                { evaluationPeriods: 1, datapointsToAlarm: 1, period: 60, expected: '1m' },
                { evaluationPeriods: 2, datapointsToAlarm: 2, period: 3600, expected: '2h' }
            ];

            testCases.forEach(({ evaluationPeriods, datapointsToAlarm, period, expected }) => {
                const cloudWatchAlarm = {
                    alarmName: 'TestAlarm',
                    metricName: 'TestMetric',
                    namespace: 'AWS/EC2',
                    statistic: 'Average',
                    period: period,
                    threshold: 80.0,
                    comparisonOperator: 'GreaterThanThreshold',
                    evaluationPeriods: evaluationPeriods,
                    datapointsToAlarm: datapointsToAlarm,
                    dimensions: []
                };

                const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
                const rule = result.groups[0].rules[0];

                expect(rule.for).toBe(expected);
            });
        });

        test('should handle supported metrics correctly', () => {
            const cloudWatchAlarm = {
                alarmName: 'HighCPU',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.expr).toContain('aws_ec2_cpu_utilization_percent');
            expect(rule.expr).not.toContain('> 80');
            expect(rule.threshold).toBe(80);
            expect(rule.condition).toBe('>');
        });

        test('should handle unsupported metrics with fallback naming', () => {
            const cloudWatchAlarm = {
                alarmName: 'CustomMetric',
                metricName: 'CustomMetricName',
                namespace: 'AWS/Custom',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.expr).toContain('aws_custom_custommetricname');
        });

        test('should include proper labels and annotations', () => {
            const cloudWatchAlarm = {
                alarmName: 'TestAlarm',
                metricName: 'TestMetric',
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

            const result = translator.translateToGrafanaAlert(cloudWatchAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.labels).toHaveProperty('severity', 'warning');
            expect(rule.labels).toHaveProperty('source', 'cloudwatch');
            expect(rule.labels).toHaveProperty('namespace', 'AWS/EC2');
            expect(rule.labels).toHaveProperty('metric', 'TestMetric');
            expect(rule.labels).toHaveProperty('instanceid', 'i-1234567890abcdef0');

            expect(rule.annotations).toHaveProperty('summary');
            expect(rule.annotations).toHaveProperty('description');
            expect(rule.annotations.summary).toContain('TestAlarm');
            expect(rule.annotations.description).toContain('TestMetric');
        });
    });

    describe('validateInput', () => {
        test('should throw error for missing required fields', () => {
            const invalidAlarm = {
                alarmName: '',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            expect(() => {
                translator.translateToGrafanaAlert(invalidAlarm);
            }).toThrow('Missing required field: alarmName');
        });

        test('should throw error for negative threshold', () => {
            const invalidAlarm = {
                alarmName: 'TestAlarm',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: -80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            expect(() => {
                translator.translateToGrafanaAlert(invalidAlarm);
            }).toThrow('Threshold must be a positive number');
        });

        test('should throw error for period less than 60 seconds', () => {
            const invalidAlarm = {
                alarmName: 'TestAlarm',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 30,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: []
            };

            expect(() => {
                translator.translateToGrafanaAlert(invalidAlarm);
            }).toThrow('Period must be at least 60 seconds');
        });

        test('should throw error when datapoints to alarm exceeds evaluation periods', () => {
            const invalidAlarm = {
                alarmName: 'TestAlarm',
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                statistic: 'Average',
                period: 300,
                threshold: 80.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 3,
                dimensions: []
            };

            expect(() => {
                translator.translateToGrafanaAlert(invalidAlarm);
            }).toThrow('Datapoints to alarm cannot be greater than evaluation periods');
        });
    });

    describe('parseDimensions', () => {
        test('should parse valid dimensions JSON', () => {
            const validJson = '[{"Name": "InstanceId", "Value": "i-1234567890abcdef0"}]';
            const result = translator.parseDimensions(validJson);

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('Name', 'InstanceId');
            expect(result[0]).toHaveProperty('Value', 'i-1234567890abcdef0');
        });

        test('should return empty array for empty input', () => {
            const result = translator.parseDimensions('');
            expect(result).toHaveLength(0);
        });

        test('should throw error for invalid JSON', () => {
            const invalidJson = '[{"Name": "InstanceId"}]'; // Missing Value

            expect(() => {
                translator.parseDimensions(invalidJson);
            }).toThrow('Invalid dimensions JSON');
        });

        test('should throw error for non-array input', () => {
            const invalidJson = '{"Name": "InstanceId", "Value": "i-1234567890abcdef0"}';

            expect(() => {
                translator.parseDimensions(invalidJson);
            }).toThrow('Dimensions must be an array');
        });
    });

    describe('convertToPrometheusMetric', () => {
        test('should convert supported metrics correctly (YACE format)', () => {
            const result = translator.convertToPrometheusMetric('AWS/EC2', 'CPUUtilization', 'yace');
            expect(result).toBe('aws_ec2_cpu_utilization_percent');
        });

        test('should convert supported metrics correctly (push_metric format)', () => {
            const result = translator.convertToPrometheusMetric('AWS/EC2', 'CPUUtilization', 'push_metric');
            expect(result).toBe('aws_ec2_cpu_utilization_percent');
        });

        test('should handle unsupported metrics with YACE fallback naming', () => {
            const result = translator.convertToPrometheusMetric('AWS/Custom', 'CustomMetric', 'yace');
            expect(result).toBe('aws_custom_custommetric');
        });

        test('should handle unsupported metrics with push_metric fallback naming', () => {
            const result = translator.convertToPrometheusMetric('AWS/Custom', 'CustomMetric', 'push_metric');
            expect(result).toBe('aws_custom_custommetric');
        });

        test('should handle special characters in metric names (YACE format)', () => {
            const result = translator.convertToPrometheusMetric('AWS/EC2', 'CPU-Utilization', 'yace');
            expect(result).toBe('aws_ec2_cpu_utilization');
        });

        test('should handle special characters in metric names (push_metric format)', () => {
            const result = translator.convertToPrometheusMetric('AWS/EC2', 'CPU-Utilization', 'push_metric');
            expect(result).toBe('aws_ec2_cpu_utilization');
        });

        test('should default to YACE format when no format specified', () => {
            const result = translator.convertToPrometheusMetric('AWS/Custom', 'CustomMetric');
            expect(result).toBe('aws_custom_custommetric');
        });
    });

    describe('convertStatistic', () => {
        test('should convert CloudWatch statistics to Prometheus functions', () => {
            expect(translator.convertStatistic('Average', 300)).toBe('avg_over_time');
            expect(translator.convertStatistic('Sum', 300)).toBe('sum_over_time');
            expect(translator.convertStatistic('Minimum', 300)).toBe('min_over_time');
            expect(translator.convertStatistic('Maximum', 300)).toBe('max_over_time');
        });

        test('should return null for unsupported statistics', () => {
            expect(translator.convertStatistic('Percentile', 300)).toBe(null);
        });
    });

    describe('convertComparisonOperator', () => {
        test('should convert CloudWatch comparison operators to Prometheus operators', () => {
            expect(translator.convertComparisonOperator('GreaterThanThreshold')).toBe('>');
            expect(translator.convertComparisonOperator('GreaterThanOrEqualToThreshold')).toBe('>=');
            expect(translator.convertComparisonOperator('LessThanThreshold')).toBe('<');
            expect(translator.convertComparisonOperator('LessThanOrEqualToThreshold')).toBe('<=');
        });

        test('should return default operator for unsupported operators', () => {
            expect(translator.convertComparisonOperator('UnknownOperator')).toBe('>');
        });
    });


    describe('convertEvaluationPeriods', () => {
        test('should convert periods to appropriate time units', () => {
            expect(translator.convertEvaluationPeriods(2, 2, 30)).toBe('1m');
            expect(translator.convertEvaluationPeriods(2, 2, 300)).toBe('10m');
            expect(translator.convertEvaluationPeriods(2, 2, 3600)).toBe('2h');
        });

        test('should use minimum of evaluation periods and datapoints to alarm', () => {
            expect(translator.convertEvaluationPeriods(3, 2, 300)).toBe('10m');
            expect(translator.convertEvaluationPeriods(2, 3, 300)).toBe('10m');
        });
    });

    describe('getSupportedMetrics', () => {
        test('should return supported metrics object', () => {
            const supportedMetrics = translator.getSupportedMetrics();
            
            expect(supportedMetrics).toHaveProperty('AWS/EC2');
            expect(supportedMetrics).toHaveProperty('AWS/RDS');
            expect(supportedMetrics).toHaveProperty('AWS/ELB');
            expect(supportedMetrics).toHaveProperty('AWS/S3');
            
            expect(supportedMetrics['AWS/EC2']).toHaveProperty('CPUUtilization');
            expect(supportedMetrics['AWS/EC2']['CPUUtilization']).toBe('aws_ec2_cpu_utilization_percent');
        });
    });

    describe('Integration tests', () => {
        test('should handle complete RDS alarm translation', () => {
            const rdsAlarm = {
                alarmName: 'RDSHighCPU',
                metricName: 'CPUUtilization',
                namespace: 'AWS/RDS',
                statistic: 'Average',
                period: 300,
                threshold: 85.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 3,
                datapointsToAlarm: 2,
                dimensions: [
                    { Name: 'DBInstanceIdentifier', Value: 'my-db-instance' }
                ]
            };

            const result = translator.translateToGrafanaAlert(rdsAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.alert).toBe('RDSHighCPU');
            expect(rule.expr).toContain('aws_rds_cpu_utilization_percent');
            expect(rule.expr).toContain('DBInstanceIdentifier="my-db-instance"');
            expect(rule.expr).not.toContain('> 85');
            expect(rule.threshold).toBe(85);
            expect(rule.condition).toBe('>');
            expect(rule.labels).toHaveProperty('dbinstanceidentifier', 'my-db-instance');
            expect(rule.labels).toHaveProperty('namespace', 'AWS/RDS');
        });

        test('should handle ELB alarm with multiple dimensions', () => {
            const elbAlarm = {
                alarmName: 'ELBHighLatency',
                metricName: 'Latency',
                namespace: 'AWS/ELB',
                statistic: 'Average',
                period: 300,
                threshold: 1.0,
                comparisonOperator: 'GreaterThanThreshold',
                evaluationPeriods: 2,
                datapointsToAlarm: 2,
                dimensions: [
                    { Name: 'LoadBalancerName', Value: 'my-load-balancer' },
                    { Name: 'AvailabilityZone', Value: 'us-west-2a' }
                ]
            };

            const result = translator.translateToGrafanaAlert(elbAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.expr).toContain('aws_elb_target_response_time_seconds');
            expect(rule.expr).toContain('LoadBalancerName="my-load-balancer"');
            expect(rule.expr).toContain('AvailabilityZone="us-west-2a"');
            expect(rule.expr).not.toContain('> 1');
            expect(rule.threshold).toBe(1);
            expect(rule.condition).toBe('>');
            expect(rule.labels).toHaveProperty('loadbalancername', 'my-load-balancer');
            expect(rule.labels).toHaveProperty('availabilityzone', 'us-west-2a');
        });

        test('should handle exported CloudWatch alarm format', () => {
            const exportedAlarm = {
                'AlarmName': 'HighCPUUtilization',
                'AlarmArn': 'arn:aws:cloudwatch:us-west-2:553636187225:alarm:HighCPUUtilization',
                'AlarmDescription': 'Alert when CPU utilization exceeds 80%',
                'AlarmConfigurationUpdatedTimestamp': '2025-09-29T13:20:09.723000+00:00',
                'ActionsEnabled': true,
                'OKActions': [],
                'AlarmActions': [],
                'InsufficientDataActions': [],
                'StateValue': 'INSUFFICIENT_DATA',
                'StateReason': 'Unchecked: Initial alarm creation',
                'StateUpdatedTimestamp': '2025-09-29T13:20:09.723000+00:00',
                'MetricName': 'CPUUtilization',
                'Namespace': 'AWS/EC2',
                'Statistic': 'Average',
                'Dimensions': [
                    {
                        'Name': 'InstanceId',
                        'Value': 'i-1234567890abcdef0'
                    }
                ],
                'Period': 300,
                'EvaluationPeriods': 2,
                'DatapointsToAlarm': 2,
                'Threshold': 80.0,
                'ComparisonOperator': 'GreaterThanThreshold',
                'StateTransitionedTimestamp': '2025-09-29T13:20:09.723000+00:00'
            };

            const result = translator.translateToGrafanaAlert(exportedAlarm);
            const rule = result.groups[0].rules[0];

            expect(rule.alert).toBe('HighCPUUtilization');
            expect(rule.expr).toContain('aws_ec2_cpu_utilization_percent');
            expect(rule.expr).toContain('InstanceId="i-1234567890abcdef0"');
            expect(rule.expr).not.toContain('> 80');
            expect(rule.threshold).toBe(80);
            expect(rule.condition).toBe('>');
            expect(rule.labels).toHaveProperty('instanceid', 'i-1234567890abcdef0');
            expect(rule.labels).toHaveProperty('namespace', 'AWS/EC2');
            expect(rule.for).toBe('10m');
        });
    });
});
