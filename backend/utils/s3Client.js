const AWS = require('aws-sdk');

/**
 * S3 client for fetching test results from AWS
 */
class S3Client {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.defaultBucket = process.env.S3_BUCKET;
  }

  /**
   * Fetch file from S3
   * @param {string} bucket - S3 bucket name
   * @param {string} key - S3 object key
   * @returns {Promise<string>} File contents
   */
  async fetchFile(bucket, key) {
    try {
      const params = {
        Bucket: bucket || this.defaultBucket,
        Key: key
      };

      console.log(`Fetching from S3: ${params.Bucket}/${params.Key}`);
      
      const data = await this.s3.getObject(params).promise();
      return data.Body.toString('utf-8');
    } catch (error) {
      console.error('S3 fetch error:', error);
      throw new Error(`Failed to fetch from S3: ${error.message}`);
    }
  }

  /**
   * List files in S3 bucket with prefix
   * @param {string} bucket - S3 bucket name
   * @param {string} prefix - Object key prefix
   * @returns {Promise<Array>} List of objects
   */
  async listFiles(bucket, prefix = '') {
    try {
      const params = {
        Bucket: bucket || this.defaultBucket,
        Prefix: prefix,
        MaxKeys: 100
      };

      const data = await this.s3.listObjectsV2(params).promise();
      
      return data.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified
      }));
    } catch (error) {
      console.error('S3 list error:', error);
      throw new Error(`Failed to list S3 objects: ${error.message}`);
    }
  }

  /**
   * Check if S3 credentials are configured
   */
  isConfigured() {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      this.defaultBucket
    );
  }
}

module.exports = S3Client;
