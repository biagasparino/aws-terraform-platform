variable "name" {
  description = "Name prefix for IAM resources"
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
