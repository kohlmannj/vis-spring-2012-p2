<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:output
		method="xml"
		indent="yes"
		version="1.0"
		encoding="us-ascii"
	/>
	
	<xsl:template match="/">
		<stories href="http://madisoncommons.org/">
			<xsl:apply-templates/>
		</stories>
	</xsl:template>
	
	<xsl:variable name="locations" select="document('locations.xml')"/>
	<xsl:variable name="topics" select="document('topics.xml')"/>
	
	<xsl:template match="node">
		<story>
			<xsl:copy-of select="title"/>
			<author><xsl:value-of select="teaser"/></author>
			<xsl:copy-of select="nid"/>
			<date><xsl:value-of select="changed"/></date>
			<author><xsl:value-of select="name"/></author>
			<xsl:apply-templates select="taxonomy/n1"/>
			<xsl:apply-templates select="taxonomy/n2"/>
		</story>
	</xsl:template>
	
	<!-- Locations -->
	<xsl:template match="taxonomy/n1">
		<locations>
			<xsl:for-each select="*[starts-with(name(),'n')]">
				<xsl:variable name="locIndex" select="text()"/>
				<xsl:copy-of select="$locations//loc[@index=$locIndex]"/>
			</xsl:for-each>
		</locations>
	</xsl:template>
	
	<!-- Tags -->
	<xsl:template match="taxonomy/n2">
		<tags>
			<xsl:for-each select="*[starts-with(name(),'n')]">
				<xsl:variable name="tagIndex" select="text()"/>
				<xsl:copy-of select="$topics//tag[@index=$tagIndex]"/>
			</xsl:for-each>
		</tags>
	</xsl:template>
	
</xsl:stylesheet>
