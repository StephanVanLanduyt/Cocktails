FROM httpd:2.4.68-alpine

COPY apache/cocktails.conf /usr/local/apache2/conf/extra/cocktails.conf

RUN echo "Include conf/extra/cocktails.conf" >> /usr/local/apache2/conf/httpd.conf

COPY src /usr/local/apache2/htdocs/
